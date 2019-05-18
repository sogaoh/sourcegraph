import H from 'history'
import { upperFirst } from 'lodash'
import React from 'react'
import { PageTitle } from '../../../components/PageTitle'
import { WithQueryParameter } from '../components/withQueryParameter/WithQueryParameter'
import { ThreadsList } from '../list/ThreadsList'
import { threadsQueryWithValues } from '../url'
import { ThreadsAreaContext } from './ThreadsArea'

interface Props extends ThreadsAreaContext {
    history: H.History
    location: H.Location
}

/**
 * The threads overview page.
 */
export const ThreadsOverviewPage: React.FunctionComponent<Props> = props => (
    <div className="threads-overview-page mt-3 container">
        <PageTitle title={upperFirst(props.kind)} />
        <WithQueryParameter
            defaultQuery={threadsQueryWithValues('', { is: [props.kind, 'open'] })}
            history={props.history}
            location={props.location}
        >
            {({ query, onQueryChange }) => <ThreadsList {...props} query={query} onQueryChange={onQueryChange} />}
        </WithQueryParameter>
    </div>
)
