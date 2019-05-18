import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import H from 'history'
import AlertOutlineIcon from 'mdi-react/AlertOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import SearchIcon from 'mdi-react/SearchIcon'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as GQL from '../../../../../shared/src/graphql/schema'
import { asError, ErrorLike, isErrorLike } from '../../../../../shared/src/util/errors'
import { fetchDiscussionThreads } from '../../../discussions/backend'
import { ListHeaderQueryLinks } from '../../threads/components/ListHeaderQueryLinks'
import { QueryParameterProps } from '../../threads/components/withQueryParameter/WithQueryParameter'
import { urlToThreadsQuery } from '../../threads/url'
import { nounForThreadKind, ThreadKind } from '../../threads/util'
import { CodemodThreadsListItem } from './CodemodThreadsListItem'

interface Props extends QueryParameterProps {
    kind: ThreadKind
    history: H.History
    location: H.Location
}

const LOADING: 'loading' = 'loading'

/**
 * A list of codemod threads.
 */
export const CodemodThreadsList: React.FunctionComponent<Props> = ({ kind, query, onQueryChange, ...props }) => {
    const [threadsOrError, setThreadsOrError] = useState<typeof LOADING | GQL.IDiscussionThreadConnection | ErrorLike>(
        LOADING
    )

    // tslint:disable-next-line: no-floating-promises because this never throws
    useMemo(async () => {
        try {
            setThreadsOrError(await fetchDiscussionThreads({ query }).toPromise())
        } catch (err) {
            setThreadsOrError(asError(err))
        }
    }, [query])

    return (
        <div className="codemod-threads-list">
            {isErrorLike(threadsOrError) ? (
                <div className="alert alert-danger mt-2">{threadsOrError.message}</div>
            ) : (
                <>
                    <div className="card">
                        <div className="card-header d-flex align-items-center font-weight-normal">
                            {threadsOrError !== LOADING && (
                                <>
                                    <ListHeaderQueryLinks
                                        activeQuery={query}
                                        links={[
                                            {
                                                label: 'open',
                                                queryField: 'is',
                                                queryValues: [kind.toLowerCase(), 'open'],
                                                count: threadsOrError.totalCount,
                                                icon: AlertOutlineIcon,
                                            },
                                            {
                                                label: 'closed',
                                                queryField: 'is',
                                                queryValues: [kind.toLowerCase(), 'closed'],
                                                count: 0,
                                                icon: CheckIcon,
                                            },
                                        ]}
                                        location={props.location}
                                        className="mr-1"
                                    />
                                    <Link to={urlToThreadsQuery(query)} className="btn btn-secondary">
                                        <SearchIcon className="icon-inline" /> Search...
                                    </Link>
                                </>
                            )}
                        </div>
                        {threadsOrError === LOADING ? (
                            <LoadingSpinner className="mt-2" />
                        ) : threadsOrError.nodes.length === 0 ? (
                            <p className="p-2 mb-0 text-muted">No {nounForThreadKind(kind, true)} found.</p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {threadsOrError.nodes.map((thread, i) => (
                                    <CodemodThreadsListItem key={i} location={props.location} thread={thread} />
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
