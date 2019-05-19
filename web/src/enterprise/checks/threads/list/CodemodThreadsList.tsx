import H from 'history'
import React from 'react'
import { QueryParameterProps } from '../../../threads/components/withQueryParameter/WithQueryParameter'
import { ThreadsList } from '../../../threads/list/ThreadsList'
import { ThreadKind } from '../../../threads/util'
import { CodemodThreadsListHeader } from './CodemodThreadsListHeader'

interface Props extends QueryParameterProps {
    kind: ThreadKind
    history: H.History
    location: H.Location
}

/**
 * The list of codemod threads.
 */
export const CodemodThreadsList: React.FunctionComponent<Props> = props => (
    <>
        <CodemodThreadsListHeader {...props} />
        <ThreadsList {...props} itemCheckboxes={false} />
    </>
)
