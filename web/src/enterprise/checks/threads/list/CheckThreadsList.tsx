import H from 'history'
import React from 'react'
import { QueryParameterProps } from '../../../threads/components/withQueryParameter/WithQueryParameter'
import { ThreadsList } from '../../../threads/list/ThreadsList'
import { ThreadKind } from '../../../threads/util'
import { CheckThreadsListHeader } from './CheckThreadsListHeader'

interface Props extends QueryParameterProps {
    kind: ThreadKind
    history: H.History
    location: H.Location
}

/**
 * The list of check threads.
 */
export const CheckThreadsList: React.FunctionComponent<Props> = props => (
    <>
        <CheckThreadsListHeader {...props} />
        <ThreadsList {...props} itemCheckboxes={false} />
    </>
)
