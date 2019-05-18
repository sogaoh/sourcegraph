import H from 'history'
import React from 'react'
import { ThreadsOverviewPage } from '../../threads/global/ThreadsOverviewPage'
import { CodemodsAreaContext } from '../global/CodemodsArea'

interface Props extends CodemodsAreaContext {
    history: H.History
    location: H.Location
}

/**
 * The codemods overview page.
 */
export const CodemodsOverviewPage: React.FunctionComponent<Props> = props => <ThreadsOverviewPage {...props} />
