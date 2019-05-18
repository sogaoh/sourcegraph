import H from 'history'
import React from 'react'
import { ListHeaderQueryLinksButtonGroup } from '../../threads/components/ListHeaderQueryLinks'
import { QueryParameterProps } from '../../threads/components/withQueryParameter/WithQueryParameter'
import { ThreadsListFilter } from '../../threads/list/ThreadsListFilter'
import { ThreadKind } from '../../threads/util'

interface Props extends QueryParameterProps {
    kind: ThreadKind

    location: H.Location
}

const QUERY_FIELDS_IN_USE = ['involves', 'author', 'mentions', 'created']

/**
 * The header for the list of codemod threads.
 */
export const CodemodThreadsListHeader: React.FunctionComponent<Props> = ({ kind, query, onQueryChange, location }) => (
    <div className="d-flex justify-content-between align-items-start">
        <div className="flex-1 mr-5">
            <ListHeaderQueryLinksButtonGroup
                query={query}
                links={[
                    {
                        label: 'Involved',
                        queryField: 'involved',
                        queryValues: ['sqs'], // TODO!(sqs): un-hardcode
                        removeQueryFields: QUERY_FIELDS_IN_USE,
                    },
                    {
                        label: 'Created',
                        queryField: 'author',
                        queryValues: ['sqs'], // TODO!(sqs): un-hardcode
                        removeQueryFields: QUERY_FIELDS_IN_USE,
                    },
                    {
                        label: 'Mentioned',
                        queryField: 'mentions',
                        queryValues: ['sqs'], // TODO!(sqs): un-hardcode
                        removeQueryFields: QUERY_FIELDS_IN_USE,
                    },
                    {
                        label: 'Recent',
                        queryField: 'sort',
                        queryValues: ['created'], // TODO!(sqs): see if this works
                        removeQueryFields: QUERY_FIELDS_IN_USE,
                    },
                ]}
                location={location}
                itemClassName="btn-outline-link font-weight-bold"
            />
        </div>
        <div className="flex-1 mb-3">
            <ThreadsListFilter value={query} onChange={onQueryChange} />
        </div>
    </div>
)
