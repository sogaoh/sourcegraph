import H from 'history'
import React from 'react'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { ErrorLike } from '../../../../../../shared/src/util/errors'
import { DiscussionsThread } from '../../../../repo/blob/discussions/DiscussionsThread'
import { ThreadSettings } from '../../settings'

interface Props extends ExtensionsControllerProps {
    thread: GQL.IDiscussionThread
    onThreadUpdate: (thread: GQL.IDiscussionThread | ErrorLike) => void
    threadSettings: ThreadSettings

    history: H.History
    location: H.Location
}

/**
 * The overview page for a single thread.
 *
 * TODO(sqs): figure out how this interacts with changes - it seems the thread would find multiple
 * hits and you might want to group them arbitrarily into batches that you will address - that is a
 * "change".
 */
export const ThreadOverviewPage: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    threadSettings,
    ...props
}) => (
    <div className="thread-overview-page">
        <DiscussionsThread
            {...props}
            threadIDWithoutKind={thread.idWithoutKind}
            className="m-3"
            commentClassName="border border-top-0"
        />
    </div>
)
