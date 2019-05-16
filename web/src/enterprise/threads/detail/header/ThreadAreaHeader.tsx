import ChevronLeftIcon from 'mdi-react/ChevronLeftIcon'
import React from 'react'
import { Link } from 'react-router-dom'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { ThreadStatusBadge } from '../../components/threadStatus/ThreadStatusBadge'
import { ThreadSettings } from '../../settings'
import { ThreadHeaderEditableTitle } from './ThreadHeaderEditableTitle'

interface Props extends ExtensionsControllerProps {
    thread: GQL.IDiscussionThread
    onThreadUpdate: (thread: GQL.IDiscussionThread) => void
    threadSettings: ThreadSettings
    areaURL: string
    className?: string
}

/**
 * The header for the thread area (for a single thread).
 */
export const ThreadAreaHeader: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    threadSettings,
    areaURL,
    className = '',
    ...props
}) => (
    <header className={`thread-area-header p-2 d-flex align-items-center ${className}`}>
        <Link className="text-muted p-1 mr-2" to="/threads" data-tooltip="Back to thread list">
            <ChevronLeftIcon className="icon-inline" />
        </Link>
        <ThreadStatusBadge thread={thread} className="mr-2" />
        <ThreadHeaderEditableTitle
            {...props}
            thread={thread}
            onThreadUpdate={onThreadUpdate}
            className="thread-area-header__thread-title flex-1"
        />
    </header>
)
