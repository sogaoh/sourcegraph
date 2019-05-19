import React from 'react'

interface Props {
    icon?: React.ReactNode

    /** Whether to show a border around the modal page. Defaults to true. */
    border?: boolean

    className?: string
    children?: React.ReactNode
}

/**
 * A page that displays a modal prompt in the middle of the screen.
 */
export const ModalPage: React.FunctionComponent<Props> = ({ icon, border = true, className = '', children }) => (
    <div className={`modal-page ${className}`}>
        <div className={`card ${border ? '' : 'border-0'}`}>
            <div className="modal-page__card-body card-body">
                {icon && <div className="modal-page__icon">{icon}</div>}
                {children}
            </div>
        </div>
    </div>
)
