import H from 'history'
import React from 'react'
import { PageTitle } from '../../../components/PageTitle'
import { WithQueryParameter } from '../../threads/components/withQueryParameter/WithQueryParameter'
import { threadsQueryWithValues } from '../../threads/url'
import { CodemodsAreaContext } from '../global/CodemodsArea'
import { CodemodThreadsList } from '../list/CodemodThreadsList'

interface Props extends CodemodsAreaContext {
    history: H.History
    location: H.Location
}

/**
 * The codemods overview page.
 */
export const CodemodsOverviewPage: React.FunctionComponent<Props> = props => (
    <div className="codemods-overview-page mt-3 container">
        <PageTitle title="Codemods" />
        <h1 className="h3">Codemods</h1>
        <WithQueryParameter
            defaultQuery={threadsQueryWithValues('', { is: [props.kind, 'open'] })}
            history={props.history}
            location={props.location}
        >
            {({ query, onQueryChange }) => (
                <CodemodThreadsList {...props} query={query} onQueryChange={onQueryChange} />
            )}
        </WithQueryParameter>
    </div>
)
