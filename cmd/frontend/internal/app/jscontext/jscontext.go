package jscontext

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/gorilla/csrf"

	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/app/assets"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/app/envvar"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/db"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/globals"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/pkg/siteid"
	"github.com/sourcegraph/sourcegraph/pkg/actor"
	"github.com/sourcegraph/sourcegraph/pkg/conf"
	"github.com/sourcegraph/sourcegraph/pkg/env"
	"github.com/sourcegraph/sourcegraph/schema"
)

var sentryDSNFrontend = env.Get("SENTRY_DSN_FRONTEND", "", "Sentry/Raven DSN used for tracking of JavaScript errors")

// immutableUser corresponds to the immutableUser type in the JS sourcegraphContext.
type immutableUser struct {
	UID        int32
	ExternalID *string `json:"externalID,omitempty"`
}

// JSContext is made available to JavaScript code via the
// "sourcegraph/app/context" module.
//
// 🚨 SECURITY: This struct is sent to all users regardless of whether or
// not they are logged in, for example on an auth.public=false private
// server. Including secret fields here is OK if it is based on the user's
// authentication above, but do not include e.g. hard-coded secrets about
// the server instance here as they would be sent to anonymous users.
type JSContext struct {
	AppRoot        string            `json:"appRoot,omitempty"`
	AppURL         string            `json:"appURL,omitempty"`
	XHRHeaders     map[string]string `json:"xhrHeaders"`
	CSRFToken      string            `json:"csrfToken"`
	UserAgentIsBot bool              `json:"userAgentIsBot"`
	AssetsRoot     string            `json:"assetsRoot"`
	Version        string            `json:"version"`
	User           *immutableUser    `json:"user"`

	DisableTelemetry bool `json:"disableTelemetry"`

	SentryDSN      string `json:"sentryDSN"`
	SiteID         string `json:"siteID"`
	Debug          bool   `json:"debug"`
	ShowOnboarding bool   `json:"showOnboarding"`
	EmailEnabled   bool   `json:"emailEnabled"`

	Site                schema.SiteConfiguration `json:"site"` // public subset of site configuration
	LikelyDockerOnMac   bool                     `json:"likelyDockerOnMac"`
	NeedServerRestart   bool                     `json:"needServerRestart"`
	IsRunningDataCenter bool                     `json:"isRunningDataCenter"`

	SourcegraphDotComMode bool `json:"sourcegraphDotComMode"`

	// Experimental features
	SearchTimeoutParameterEnabled bool `json:"searchTimeoutParameterEnabled"`
	ShowMissingReposEnabled       bool `json:"showMissingReposEnabled"`

	AccessTokensEnabled bool `json:"accessTokensEnabled"`
}

// NewJSContextFromRequest populates a JSContext struct from the HTTP
// request.
func NewJSContextFromRequest(req *http.Request) JSContext {
	actor := actor.FromContext(req.Context())

	headers := make(map[string]string)
	headers["x-sourcegraph-client"] = globals.AppURL.String()
	headers["X-Requested-By"] = "Sourcegraph" // required for httpapi to use cookie auth

	// -- currently we don't associate XHR calls with the parent page's span --
	// if span := opentracing.SpanFromContext(req.Context()); span != nil {
	// 	if err := opentracing.GlobalTracer().Inject(span.Context(), opentracing.HTTPHeaders, opentracing.TextMapCarrier(headers)); err != nil {
	// 		return JSContext{}, err
	// 	}
	// }

	// Propagate Cache-Control no-cache and max-age=0 directives
	// to the requests made by our client-side JavaScript. This is
	// not a perfect parser, but it catches the important cases.
	if cc := req.Header.Get("cache-control"); strings.Contains(cc, "no-cache") || strings.Contains(cc, "max-age=0") {
		headers["Cache-Control"] = "no-cache"
	}

	csrfToken := csrf.Token(req)
	headers["X-Csrf-Token"] = csrfToken

	var user *immutableUser
	if actor.IsAuthenticated() {
		user = &immutableUser{UID: actor.UID}

		if u, err := db.Users.GetByID(req.Context(), actor.UID); err == nil && u != nil {
			user.ExternalID = u.ExternalID
		}
	}

	siteID := siteid.Get()

	// Show the site init screen?
	siteConfig, err := db.SiteConfig.Get(req.Context())
	showOnboarding := err == nil && !siteConfig.Initialized

	// 🚨 SECURITY: This struct is sent to all users regardless of whether or
	// not they are logged in, for example on an auth.public=false private
	// server. Including secret fields here is OK if it is based on the user's
	// authentication above, but do not include e.g. hard-coded secrets about
	// the server instance here as they would be sent to anonymous users.
	return JSContext{
		AppURL:              globals.AppURL.String(),
		XHRHeaders:          headers,
		CSRFToken:           csrfToken,
		UserAgentIsBot:      isBot(req.UserAgent()),
		AssetsRoot:          assets.URL("").String(),
		Version:             env.Version,
		User:                user,
		DisableTelemetry:    conf.Get().DisableTelemetry,
		SentryDSN:           sentryDSNFrontend,
		Debug:               envvar.DebugMode(),
		SiteID:              siteID,
		ShowOnboarding:      showOnboarding,
		EmailEnabled:        conf.CanSendEmail(),
		Site:                publicSiteConfiguration,
		LikelyDockerOnMac:   likelyDockerOnMac(),
		NeedServerRestart:   conf.NeedServerRestart(),
		IsRunningDataCenter: os.Getenv("GOREMAN_RPC_ADDR") != "",

		SourcegraphDotComMode: envvar.SourcegraphDotComMode(),

		// Experiments. We pass these through explicitly so we can
		// do the default behavior only in Go land.
		SearchTimeoutParameterEnabled: conf.SearchTimeoutParameterEnabled(),
		ShowMissingReposEnabled:       conf.ShowMissingReposEnabled(),

		AccessTokensEnabled: conf.AccessTokensEnabled(),
	}
}

// publicSiteConfiguration is the subset of the site.schema.json site configuration
// that is necessary for the web app and is not sensitive/secret.
var publicSiteConfiguration = schema.SiteConfiguration{
	AuthAllowSignup: conf.GetTODO().AuthAllowSignup,
}

var isBotPat = regexp.MustCompile(`(?i:googlecloudmonitoring|pingdom.com|go .* package http|sourcegraph e2etest|bot|crawl|slurp|spider|feed|rss|camo asset proxy|http-client|sourcegraph-client)`)

func isBot(userAgent string) bool {
	return isBotPat.MatchString(userAgent)
}

func likelyDockerOnMac() bool {
	data, err := ioutil.ReadFile("/proc/cmdline")
	if err != nil {
		return false // permission errors, or maybe not a Linux OS, etc. Assume we're not docker for mac.
	}
	return bytes.Contains(data, []byte("mac")) || bytes.Contains(data, []byte("osx"))
}
