import classNames from 'classnames'
import formatDistance from 'date-fns/formatDistance'
import H from 'history'
import { upperFirst } from 'lodash'
import AlertDecagramIcon from 'mdi-react/AlertDecagramIcon'
import CancelIcon from 'mdi-react/CancelIcon'
import CloseCircleIcon from 'mdi-react/CloseCircleIcon'
import MessageOutlineIcon from 'mdi-react/MessageOutlineIcon'
import React from 'react'
import { CodeExcerpt } from '../../../../../../shared/src/components/CodeExcerpt'
import { displayRepoName } from '../../../../../../shared/src/components/RepoFileLink'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { fetchHighlightedFileLines } from '../../../../repo/backend'
import { SourceItemDiscussion } from './SourceItemDiscussion'

export interface ThreadSourceItem extends GQL.IDiscussionThreadTargetRepo {
    updatedAt: string
    updatedBy: string
    commentsCount: number
    status: 'open' | 'closed' | 'ignored'
}

interface Props extends ExtensionsControllerProps {
    item: ThreadSourceItem
    className?: string
    isLightTheme: boolean
    history: H.History
    location: H.Location
}

const STATUS_ICONS: Record<ThreadSourceItem['status'], React.ComponentType<{ className?: string }>> = {
    open: AlertDecagramIcon,
    closed: CloseCircleIcon,
    ignored: CancelIcon,
}

/**
 * A source item in a thread that refers to a text document location.
 */
export const TextDocumentLocationSourceItem: React.FunctionComponent<Props> = ({
    item,
    className = '',
    isLightTheme,
    ...props
}) => {
    const Icon = STATUS_ICONS[item.status]
    return (
        <div className={`card border ${className}`}>
            <div className="card-header d-flex align-items-start">
                <Icon
                    className={classNames('icon-inline', 'mr-2', 'h5', 'mb-0', {
                        'text-info': status === 'open',
                        'text-danger': status === 'closed',
                        'text-muted': status === 'ignored',
                    })}
                    data-tooltip={upperFirst(status)}
                />
                <div className="flex-1">
                    <h3 className="d-flex align-items-center mb-0">
                        <a
                            href="TODO!(sqs)"
                            target="_blank"
                            // tslint:disable-next-line:jsx-ban-props
                            style={{ color: 'var(--body-color)' }}
                        >
                            {item.path ? (
                                <>
                                    <span className="font-weight-normal">{displayRepoName(item.repository.name)}</span>{' '}
                                    &mdash; <code>{item.path}</code>
                                </>
                            ) : (
                                displayRepoName(item.repository.name)
                            )}
                        </a>
                    </h3>
                    <small className="text-muted">
                        Changed {formatDistance(Date.parse(item.updatedAt), Date.now())} ago by{' '}
                        <strong>{item.updatedBy}</strong>
                    </small>
                </div>
                <div>
                    {item.commentsCount > 0 && (
                        <ul className="list-inline d-flex align-items-center">
                            <li className="list-inline-item">
                                <small className="text-muted">
                                    <MessageOutlineIcon className="icon-inline" /> {item.commentsCount}
                                </small>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
            {item.path && (
                <CodeExcerpt
                    repoName={item.repository.name}
                    commitID="master" // TODO!(sqs)
                    filePath={item.path}
                    context={3}
                    highlightRanges={
                        item.selection
                            ? [
                                  {
                                      line: item.selection.startLine,
                                      character: item.selection.startCharacter,
                                      highlightLength:
                                          item.selection.endCharacter - item.selection.startCharacter || 10, // TODO!(sqs): hack to avoid having non-highlighted lines
                                  },
                              ]
                            : []
                    }
                    className="p-1"
                    isLightTheme={isLightTheme}
                    fetchHighlightedFileLines={fetchHighlightedFileLines}
                />
            )}
            <SourceItemDiscussion {...props} className="border-top" />
        </div>
    )
}
