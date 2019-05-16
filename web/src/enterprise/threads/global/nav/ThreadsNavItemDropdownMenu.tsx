import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DropdownItem, DropdownMenu } from 'reactstrap'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../../shared/src/util/errors'
import { fetchDiscussionThreads } from '../../../../discussions/backend'

interface Props {
    className?: string
}

const LOADING: 'loading' = 'loading'

/**
 * A dropdown menu with a list of navigation links related to threads.
 */
export const ThreadsNavItemDropdownMenu: React.FunctionComponent<Props> = ({ className = '' }) => {
    const [threadsOrError, setThreadsOrError] = useState<typeof LOADING | GQL.IDiscussionThreadConnection | ErrorLike>(
        LOADING
    )

    // tslint:disable-next-line: no-floating-promises
    useMemo(async () => {
        try {
            setThreadsOrError(await fetchDiscussionThreads({}).toPromise())
        } catch (err) {
            setThreadsOrError(asError(err))
        }
    }, [])

    const MAX_THREADS = 5 // TODO!(sqs): hack

    return (
        <DropdownMenu right={true} className={className}>
            <Link to="/threads" className="dropdown-item d-flex align-items-center justify-content-between">
                Active
                <span className="badge badge-secondary">57</span>
            </Link>
            <Link to="/threads" className="dropdown-item d-flex align-items-center justify-content-between">
                &nbsp;&nbsp;&nbsp; New matches
                <span className="badge badge-secondary">2</span>
            </Link>
            <Link to="/threads" className="dropdown-item d-flex align-items-center justify-content-between">
                &nbsp;&nbsp;&nbsp; In-progress changes
                <span className="badge badge-secondary">3</span>
            </Link>
            <DropdownItem divider={true} />
            {threadsOrError === LOADING ? (
                <DropdownItem header={true} className="py-1">
                    Loading threads...
                </DropdownItem>
            ) : (
                !isErrorLike(threadsOrError) && (
                    <>
                        <DropdownItem header={true} className="py-1">
                            Recent
                        </DropdownItem>
                        {threadsOrError.nodes.slice(0, MAX_THREADS).map(thread => (
                            <Link key={thread.id} to={thread.url} className="dropdown-item text-truncate">
                                <small className="text-muted">#{thread.idWithoutKind}</small> {thread.title}
                            </Link>
                        ))}
                    </>
                )
            )}
            <DropdownItem divider={true} />
            <Link to="/threads/-/new" className="dropdown-item">
                Start new thread
            </Link>
        </DropdownMenu>
    )
}
