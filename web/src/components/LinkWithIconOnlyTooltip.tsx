import React from 'react'
import { Link } from 'react-router-dom'

/**
 * A link that shows a tooltipped icon on narrow screens and a non-tooltipped icon label on wider
 * screens.
 *
 * The tooltip is hidden on wider screens because it is redundant with the label text.
 */
export const LinkWithIconOnlyTooltip: React.FunctionComponent<{
    to: string
    text: string
    tooltip?: string
    icon: React.ComponentType<{ className?: string }>
    className?: string
}> = ({ to, text, tooltip = text, icon: Icon, className = '' }) => (
    <Link to={to} className={`${className} d-flex align-items-center`}>
        <Icon className="icon-inline d-xl-none" data-tooltip={tooltip} />
        <Icon className="icon-inline d-none d-xl-inline-block" />
        <span className="d-none d-xl-inline-block ml-1">{text}</span>
    </Link>
)
