import SearchIcon from 'mdi-react/SearchIcon'
import React, { useCallback, useState } from 'react'
import { TokenTextInput } from '../../../../shared/src/components/tokenTextInput/TokenTextInput'
import { QueryInputInlineOptions } from './query/QueryInputInlineOptions'
import { QueryInputProps } from './QueryInput'

interface Props extends QueryInputProps {
    className?: string
}

export const QueryInput3: React.FunctionComponent<Props> = ({ value, onChange, className = '' }) => {
    const [isFocused, setIsFocused] = useState(false)
    const onFocus = useCallback(() => setIsFocused(true), [isFocused])
    const onBlur = useCallback(() => setIsFocused(false), [isFocused])
    return (
        <div
            className={`query-input3 ${
                isFocused ? 'query-input3--focus' : ''
            } input-group border rounded align-items-start ${className}`}
        >
            <div className="input-group-prepend">
                <span className="input-group-text border-0 px-1 bg-transparent">
                    <SearchIcon className="icon-inline" />
                </span>
            </div>
            <TokenTextInput
                className="query-input3__input form-control border-0 rounded-0 query-input2__input e2e-query-input pl-1"
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="Search code..."
            />
            <QueryInputInlineOptions className="input-group-append" />
        </div>
    )
}
