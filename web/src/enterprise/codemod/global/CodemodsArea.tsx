import React from 'react'
import { ThreadsArea, ThreadsAreaProps } from '../../threads/global/ThreadsArea'

interface Props extends Pick<ThreadsAreaProps, Exclude<keyof ThreadsAreaProps, 'kind'>> {}

/**
 * The global codemods area.
 */
export const CodemodsArea: React.FunctionComponent<Props> = props => <ThreadsArea {...props} kind="codemod" />
