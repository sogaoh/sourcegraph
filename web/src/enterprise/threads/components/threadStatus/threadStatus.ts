import CommentTextMultipleIcon from 'mdi-react/CommentTextMultipleIcon'
import FeatureSearchIcon from 'mdi-react/FeatureSearchIcon'
import * as GQL from '../../../../../../shared/src/graphql/schema'

/**
 * The subset of {@link GQL.IDiscussionThread}'s that is needed for displaying the thread's status.
 */
export interface DiscussionThreadWithStatus extends Pick<GQL.IDiscussionThread, 'status'> {
    targets: GQL.IDiscussionThread['targets'] | { totalCount: number }
}

type ThreadStatusColor = 'success' | 'danger'

const STATUS_COLOR: Record<GQL.DiscussionThreadStatus, ThreadStatusColor> = {
    OPEN: 'success',
    CLOSED: 'danger',
}

const hasTargets = (thread: DiscussionThreadWithStatus): boolean => thread.targets.totalCount > 0

const threadIcon = (thread: DiscussionThreadWithStatus): React.ComponentType<{ className?: string }> =>
    hasTargets(thread) ? FeatureSearchIcon : CommentTextMultipleIcon

const STATUS_TEXT: Record<GQL.DiscussionThreadStatus, string> = {
    OPEN: 'Open',
    CLOSED: 'Closed',
}

const threadTooltip = (thread: DiscussionThreadWithStatus): string => {
    const kind = hasTargets(thread) ? ' (query active)' : ''
    return `${STATUS_TEXT[thread.status]}${kind}`
}

/**
 * Returns information about how to display the thread's status.
 */
export const threadStatusInfo = (
    thread: DiscussionThreadWithStatus
): {
    color: 'success' | 'danger'
    icon: React.ComponentType<{ className?: string }>
    text: string
    tooltip: string
} => ({
    color: STATUS_COLOR[thread.status],
    icon: threadIcon(thread),
    text: STATUS_TEXT[thread.status],
    tooltip: threadTooltip(thread),
})
