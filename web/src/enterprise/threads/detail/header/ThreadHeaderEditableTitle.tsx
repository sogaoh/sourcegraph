import React, { useCallback, useState } from 'react'
import { NotificationType } from '../../../../../../shared/src/api/client/services/notifications'
import { ExtensionsControllerProps } from '../../../../../../shared/src/extensions/controller'
import * as GQL from '../../../../../../shared/src/graphql/schema'
import { Form } from '../../../../components/Form'
import { updateThread } from '../../../../discussions/backend'
import { DiscussionThreadWithStatus } from '../../components/threadStatus/threadStatus'
import { ThreadStatusBadge } from '../../components/threadStatus/ThreadStatusBadge'

interface Props {
    thread: Pick<GQL.IDiscussionThread, 'id' | 'idWithoutKind' | 'title'> & DiscussionThreadWithStatus
    onThreadUpdate: (thread: GQL.IDiscussionThread) => void
    className?: string
    extensionsController: {
        services: {
            notifications: {
                showMessages: Pick<
                    ExtensionsControllerProps<
                        'services'
                    >['extensionsController']['services']['notifications']['showMessages'],
                    'next'
                >
            }
        }
    }

    /** Provided by tests only. */
    _updateThread?: typeof updateThread
}

/**
 * The title in the thread header, which has an edit mode.
 */
// tslint:disable: jsx-no-lambda
export const ThreadHeaderEditableTitle: React.FunctionComponent<Props> = ({
    thread,
    onThreadUpdate,
    className = '',
    extensionsController,
    _updateThread = updateThread,
}) => {
    const [state, setState] = useState<'viewing' | 'editing' | 'loading'>('viewing')
    const [uncommittedTitle, setUncommittedTitle] = useState(thread.title)

    const onSubmit: React.FormEventHandler = async e => {
        e.preventDefault()
        setState('loading')
        try {
            const updatedThread = await _updateThread({ threadID: thread.id, title: uncommittedTitle })
            onThreadUpdate(updatedThread)
            setUncommittedTitle(updatedThread.title)
        } catch (err) {
            extensionsController.services.notifications.showMessages.next({
                message: `Error editing thread title: ${err.message}`,
                type: NotificationType.Error,
            })
        } finally {
            setState('viewing')
        }
    }

    const onEditClick = useCallback(() => setState('editing'), [])
    const onCancelClick = useCallback<React.MouseEventHandler>(
        e => {
            e.preventDefault()
            setState('viewing')
            setUncommittedTitle(thread.title)
        },
        [thread.title]
    )

    return state === 'viewing' ? (
        <div className={`d-flex align-items-start justify-content-between flex-wrap ${className}`}>
            <div className="d-flex align-items-center">
                <ThreadStatusBadge thread={thread} className="mr-2 mt-1" />
                <h1 className="font-weight-normal mb-0">
                    {thread.title} <span className="text-muted font-weight-normal">#{thread.idWithoutKind}</span>
                </h1>
            </div>
            <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={onEditClick}>
                Edit
            </button>
        </div>
    ) : (
        <Form className={`form d-flex ${className}`} onSubmit={onSubmit}>
            <input
                type="text"
                className="form-control form-control-lg flex-1 mr-2"
                value={uncommittedTitle}
                onChange={e => setUncommittedTitle(e.currentTarget.value)}
                placeholder="Title"
                autoComplete="off"
                autoFocus={true}
                disabled={state === 'loading'}
            />
            <div className="text-nowrap flex-0 d-flex align-items-center">
                <button type="submit" className="btn btn-success btn-lg" disabled={state === 'loading'}>
                    Save
                </button>
                <button type="reset" className="btn btn-link" onClick={onCancelClick} disabled={state === 'loading'}>
                    Cancel
                </button>
            </div>
        </Form>
    )
}
