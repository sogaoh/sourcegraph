import H from 'history'
import React from 'react'
import { ChecksAreaContext } from '..../global/ChecksArea
import { ThreadsOverviewPage } from '../../threads/global/ThreadsOverviewPage'

interface Props extends ChecksAreaContext {
    history: H.History
    location: H.Location
}

/**
 * The checks overview page.
 */
export const ChecksOverviewPage: React.FunctionComponent<Props> = props => <ThreadsOverviewPage {...props} />
