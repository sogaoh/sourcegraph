import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import H from 'history'
import AlertOutlineIcon from 'mdi-react/AlertOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import React from 'react'
import { isErrorLike } from '../../../../../shared/src/util/errors'
import { ListHeaderQueryLinksNav } from '../components/ListHeaderQueryLinks'
import { QueryParameterProps } from '../components/withQueryParameter/WithQueryParameter'
import {
    ThreadsQueryResultProps,
    WithThreadsQueryResults,
} from '../components/withThreadsQueryResults/WithThreadsQueryResults'
import { nounForThreadKind, ThreadKind } from '../util'
import { ThreadsListHeaderFilterButtonDropdown } from './ThreadsListHeaderFilterButtonDropdown'
import { ThreadsListItem } from './ThreadsListItem'

export interface ThreadsListContext {
    /**
     * Whether each item should have a checkbox.
     */
    itemCheckboxes?: boolean
}

interface Props extends QueryParameterProps, ThreadsListContext {
    kind: ThreadKind

    /**
     * Renders the list header.
     */
    listHeader?: (props: Props & ThreadsQueryResultProps) => JSX.Element | null

    history: H.History
    location: H.Location
}

const LOADING: 'loading' = 'loading'

/**
 * The list of threads with a header.
 */
export const ThreadsList: React.FunctionComponent<Props> = ({
    kind,
    listHeader,
    itemCheckboxes,
    query,
    onQueryChange,
    ...props
}) => (
    <WithThreadsQueryResults query={query}>
        {({ threadsOrError }) => (
            <div className="threads-list">
                {isErrorLike(threadsOrError) ? (
                    <div className="alert alert-danger mt-2">{threadsOrError.message}</div>
                ) : (
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between font-weight-normal">
                            {itemCheckboxes && (
                                <div className="form-check mx-2">
                                    <input
                                        className="form-check-input position-static"
                                        type="checkbox"
                                        aria-label="Select item"
                                    />
                                </div>
                            )}
                            {threadsOrError !== LOADING ? (
                                <ListHeaderQueryLinksNav
                                    query={query}
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
                                    className="flex-1 nav"
                                />
                            ) : (
                                <div className="flex-1" />
                            )}
                            <div>
                                <ThreadsListHeaderFilterButtonDropdown
                                    header="Filter by who's assigned"
                                    items={['sqs (you)', 'ekonev', 'jleiner', 'ziyang', 'kting7', 'ffranksena']}
                                >
                                    Assignee
                                </ThreadsListHeaderFilterButtonDropdown>
                                <ThreadsListHeaderFilterButtonDropdown
                                    header="Filter by label"
                                    items={[
                                        'perf',
                                        'tech-lead',
                                        'services',
                                        'bugs',
                                        'build',
                                        'noisy',
                                        'security',
                                        'appsec',
                                        'infosec',
                                        'compliance',
                                        'docs',
                                    ]}
                                >
                                    Labels
                                </ThreadsListHeaderFilterButtonDropdown>
                                <ThreadsListHeaderFilterButtonDropdown
                                    header="Sort by"
                                    items={['Priority', 'Most recently updated', 'Least recently updated']}
                                >
                                    Sort
                                </ThreadsListHeaderFilterButtonDropdown>
                            </div>
                        </div>
                        {threadsOrError === LOADING ? (
                            <LoadingSpinner className="mt-2" />
                        ) : threadsOrError.nodes.length === 0 ? (
                            <p className="p-2 mb-0 text-muted">No {nounForThreadKind(kind, true)} found.</p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {threadsOrError.nodes.map((thread, i) => (
                                    <ThreadsListItem
                                        key={i}
                                        location={props.location}
                                        thread={thread}
                                        itemCheckboxes={itemCheckboxes}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        )}
    </WithThreadsQueryResults>
)
