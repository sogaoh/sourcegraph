package idx

import (
	"context"
	"fmt"
	"os"
	"strings"

	log15 "gopkg.in/inconshreveable/log15.v2"

	"github.com/sourcegraph/sourcegraph/pkg/api"
	"github.com/sourcegraph/sourcegraph/pkg/conf"
	"github.com/sourcegraph/sourcegraph/pkg/inventory"
)

var LSPEnabled bool

func init() {
	if _, exists := os.LookupEnv("LSP_PROXY"); exists {
		LSPEnabled = true
	}
}

// index updates the cross-repo code intelligence indexes for the given repository at the given revision and enqueues
// further repos to index if applicable.
func (w *Worker) index(repoName api.RepoURI, rev string, isPrimary bool) (err error) {
	repo, commit, err := resolveRevision(w.Ctx, repoName, rev)
	if err != nil {
		// Avoid infinite loop for always cloning test.
		if repo != nil && repo.URI == "github.com/sourcegraphtest/AlwaysCloningTest" {
			return nil
		}
		return err
	}

	// Check if index is already up-to-date
	if repo.IndexedRevision != nil && (repo.FreezeIndexedRevision || *repo.IndexedRevision == commit) {
		w.handleLangServersMigration(repo, commit)
		return nil
	}

	// Get language
	inv, err := api.InternalClient.ReposGetInventoryUncached(w.Ctx, repo.ID, commit)
	if err != nil {
		return fmt.Errorf("Repos.GetInventory failed: %s", err)
	}
	lang := inv.PrimaryProgrammingLanguage()

	// Automatically enable the language server for each language detected in
	// the repository.
	w.enableLangservers(inv)

	// Update global refs & packages index
	if !repo.Fork() && LSPEnabled {
		var errs []error
		if err := api.InternalClient.DefsRefreshIndex(w.Ctx, repo.URI, commit); err != nil {
			errs = append(errs, fmt.Errorf("Defs.RefreshIndex failed: %s", err))
		}

		if err := api.InternalClient.PkgsRefreshIndex(w.Ctx, repo.URI, commit); err != nil {
			errs = append(errs, fmt.Errorf("Pkgs.RefreshIndex failed: %s", err))
		}

		if isPrimary {
			// Spider out to index dependencies
			if err := w.enqueueDependencies(lang, repo.ID); err != nil {
				errs = append(errs, fmt.Errorf("Could not enqueue dependencies: %s", err))
			}
		}

		if err := makeMultiErr(errs...); err != nil {
			return err
		}
	}

	err = api.InternalClient.ReposUpdateIndex(w.Ctx, repo.ID, commit, lang)
	if err != nil {
		return err
	}
	return nil
}

// enableLangservers enables language servers for the given repo inventory.
func (w *Worker) enableLangservers(inv *inventory.Inventory) {
	if conf.IsDataCenter(conf.DeployType()) {
		// Running in Data Center mode, do not auto-enable language servers.
		return
	}
	if conf.IsDev(conf.DeployType()) && !conf.DebugManageDocker() {
		// Running in dev mode with managed docker disabled.
		return
	}

	// Enable the language server for each language detected in the repository.
	for _, language := range inv.Languages {
		err := langServersEnableLanguage(w.Ctx, strings.ToLower(language.Name))

		// Note: We ignore "not authenticated" errors here as they would just
		// indicate one of two things:
		//
		// 1. The language is a built-in one, but an admin user has explicitly
		//    disabled it. We do not want to act as an admin and explicitly
		//    override their disable action.
		// 2. The language is not a built-in one, and by 'enabling' it we would
		//    actually just be modifying an entry to the site config. Only
		//    admins can do this, and this is not an action we want to perform
		//    here.
		//
		if err != nil && !strings.Contains(err.Error(), "not authenticated") {
			// Failure here should never be fatal to the rest of the
			// indexing operations.
			log15.Error("failed to automatically enable language server", "language", strings.ToLower(language.Name), "error", err)
		}
	}
}

// handleLangServersMigration handles a migration path: The repository is
// already indexed. But it is still useful to enable language servers
// automatically at this point for users who've already added all of their
// repositories before we supported automatic language server management.
//
// TODO(slimsag): remove this code after May 3, 2018. Also remove
// api.InternalClient.ReposGetInventory since this is the only user of it.
func (w *Worker) handleLangServersMigration(repo *api.Repo, commit api.CommitID) {
	// Note: we use ReposGetInventory not the uncached variant because this
	// runs on every refresh operation and it needs to be performant.
	inv, err := api.InternalClient.ReposGetInventory(w.Ctx, repo.ID, commit)
	if err != nil {
		log15.Error("failed to automatically enable language servers, Repos.GetInventory failed", "error", err)
		return
	}

	// Automatically enable the language server for each language detected in
	// the repository.
	w.enableLangservers(inv)
}

// enqueueDependencies makes a best effort to enqueue dependencies of the specified repository
// (repo) for certain languages. The languages covered are languages where the language server
// itself cannot resolve dependencies to source repository URLs. For those languages, dependency
// repositories must be indexed before cross-repo jump-to-def can work. enqueueDependencies tries to
// best-effort determine what those dependencies are and enqueue them.
func (w *Worker) enqueueDependencies(lang string, repo api.RepoID) error {
	// do nothing if this is not a language that requires heuristic dependency resolution
	if lang != "Java" {
		return nil
	}
	log15.Info("Enqueuing dependencies for repo", "repo", repo, "lang", lang)

	unfetchedDeps, err := api.InternalClient.ReposUnindexedDependencies(w.Ctx, repo, lang)
	if err != nil {
		return err
	}

	// Resolve and enqueue unindexed dependencies for indexing
	resolvedDeps := resolveDependencies(w.Ctx, lang, unfetchedDeps)
	resolvedDepsList := make([]api.RepoURI, 0, len(resolvedDeps))
	for rawDepRepo := range resolvedDeps {
		repo, err := api.InternalClient.ReposGetByURI(w.Ctx, rawDepRepo)
		if err != nil {
			log15.Warn("Could not resolve repository, skipping", "repo", rawDepRepo, "error", err)
			continue
		}
		w.primary.Enqueue(repo.URI, "")
		resolvedDepsList = append(resolvedDepsList, repo.URI)
	}
	log15.Info("Enqueued dependencies for repo", "repo", repo, "lang", lang, "num", len(resolvedDeps), "dependencies", resolvedDepsList)
	return nil
}

// resolveDependencies resolves a list of DependencyReferences to a set of source repository URIs.
// This mapping is different from language to language and is often heuristic, so different
// languages are handled case-by-case.
func resolveDependencies(ctx context.Context, lang string, deps []*api.DependencyReference) map[api.RepoURI]struct{} {
	switch lang {
	case "Java":
		if !Google.Enabled() {
			return nil
		}

		// Best-effort fetch from GitHub via Google Search. Equivalent to searching for "site:github.com $groupId:$artifactId".
		depQueries := make(map[string]struct{})
		for _, dep := range deps {
			if dep.DepData == nil {
				continue
			}
			id, ok := dep.DepData["id"].(string)
			if !ok {
				continue
			}
			depQueries[id] = struct{}{}
		}
		resolvedDeps := map[api.RepoURI]struct{}{}
		for depQuery := range depQueries {
			depRepoURI, err := Google.Search(depQuery)
			if err != nil {
				log15.Warn("Could not resolve dependency to repository via Google, skipping", "query", depQuery, "error", err)
				continue
			}
			resolvedDeps[depRepoURI] = struct{}{}
		}
		return resolvedDeps
	default:
		return nil
	}
}

type multiError []error

func makeMultiErr(errs ...error) error {
	if len(errs) == 0 {
		return nil
	}
	var nonnil []error
	for _, err := range errs {
		if err != nil {
			nonnil = append(nonnil, err)
		}
	}
	if len(nonnil) == 0 {
		return nil
	}
	if len(nonnil) == 1 {
		return nonnil[0]
	}
	return multiError(nonnil)
}

func (e multiError) Error() string {
	errs := make([]string, len(e))
	for i := 0; i < len(e); i++ {
		errs[i] = e[i].Error()
	}
	return fmt.Sprintf("multiple errors:\n\t%s", strings.Join(errs, "\n\t"))
}
