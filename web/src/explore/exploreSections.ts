import { lazyComponent } from '../util/lazyComponent'
import { ExploreSectionDescriptor } from './ExploreArea'

export const exploreSections: ReadonlyArray<ExploreSectionDescriptor> = [
    {
        render: lazyComponent(
            () => import('../extensions/explore/ExtensionViewsExploreSection'),
            'ExtensionViewsExploreSection'
        ),
    },
    {
        render: lazyComponent(
            () => import('../integrations/explore/IntegrationsExploreSection'),
            'IntegrationsExploreSection'
        ),
    },
    {
        render: lazyComponent(() => import('../repo/explore/RepositoriesExploreSection'), 'RepositoriesExploreSection'),
    },
    {
        render: lazyComponent(
            () => import('../search/saved-queries/explore/SavedSearchesExploreSection'),
            'SavedSearchesExploreSection'
        ),
    },
    {
        render: lazyComponent(
            () => import('../usageStatistics/explore/SiteUsageExploreSection'),
            'SiteUsageExploreSection'
        ),
        condition: ({ authenticatedUser }) =>
            (!window.context.sourcegraphDotComMode || window.context.debug) && !!authenticatedUser,
    },
]
