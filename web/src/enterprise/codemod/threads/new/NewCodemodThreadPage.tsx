import AlphabeticalIcon from 'mdi-react/AlphabeticalIcon'
import AppleFinderIcon from 'mdi-react/AppleFinderIcon'
import ChevronRightIcon from 'mdi-react/ChevronRightIcon'
import DeleteSweepIcon from 'mdi-react/DeleteSweepIcon'
import DockerIcon from 'mdi-react/DockerIcon'
import LanguageGoIcon from 'mdi-react/LanguageGoIcon'
import LanguagePythonIcon from 'mdi-react/LanguagePythonIcon'
import LanguageTypescriptIcon from 'mdi-react/LanguageTypescriptIcon'
import NpmIcon from 'mdi-react/NpmIcon'
import ReactIcon from 'mdi-react/ReactIcon'
import React, { CSSProperties, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ModalPage } from '../../../../components/ModalPage'
import { PageTitle } from '../../../../components/PageTitle'

const CODEMOD_TYPES: {
    id: string
    title: string
    description?: string
    icon?: React.ComponentType<{ className?: string; style?: CSSProperties }>
    iconColor?: string
}[] = [
    {
        id: 'codemod.textFindReplace',
        title: 'Text replacement',
        description: 'Replace a string with another string',
        icon: AlphabeticalIcon,
    },
    {
        id: 'codemod.upgradeNpmDependency',
        title: 'Upgrade npm dependency',
        description: 'Ensure an npm dependency is at a specific version',
        icon: NpmIcon,
        iconColor: '#cb3837',
    },
    {
        id: 'codemod.typescriptTSConfig',
        title: 'Standardize TypeScript tsconfig.json files',
        description: "Enforce consistency among TypeScript projects' tsconfig.json files",
        icon: LanguageTypescriptIcon,
        iconColor: '#2774c3',
    },
    {
        id: 'codemod.dockerfileLint',
        title: 'Dockerfile lint',
        description: 'Find and fix common mistakes in Dockerfiles',
        icon: DockerIcon,
        iconColor: '#0db7ed',
    },
    {
        id: 'codemod.goLint',
        title: 'Go lint',
        description: 'Fix common mistakes in Go code',
        icon: LanguageGoIcon,
    },
    {
        id: 'codemod.reactLint',
        title: 'React lint',
        description: 'Fix common problems in React code & migrate deprecated React code',
        icon: ReactIcon,
        iconColor: '#00d8ff',
    },
    {
        id: 'codemod.removeDSStore',
        title: 'No macOS .DS_Store files',
        description: 'Deletes and gitignores undesired macOS temp and metadata files',
        icon: AppleFinderIcon,
    },
    {
        id: 'codemod.removePYCFiles',
        title: 'No *.pyc files',
        description: 'Deletes and gitignores undesired Python temp files',
        icon: LanguagePythonIcon,
    },
    {
        id: 'codemod.removeYarnNpmTempFiles',
        title: 'No undesired Yarn/npm temporary files',
        description: 'Deletes and gitignores yarn-error.log and npm-debug.log files',
        icon: DeleteSweepIcon,
    },
]

interface Props {}

export const NewCodemodThreadPage: React.FunctionComponent<Props> = () => {
    const [query, setQuery] = useState('')
    const onQueryChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        e => setQuery(e.currentTarget.value),
        [query]
    )

    return (
        <>
            <PageTitle title="New codemod" />
            <ModalPage border={false} className="justify-content-start mt-4">
                <h2 className="mb-3">New codemod...</h2>
                <ul className="list-group">
                    <li className="list-group-item p-0">
                        <input
                            type="search"
                            className="form-control border-0 px-3 py-2 rounded-bottom-0"
                            value={query}
                            onChange={onQueryChange}
                            placeholder="Search"
                        />
                    </li>
                    {CODEMOD_TYPES.filter(
                        ({ title, description }) =>
                            title.toLowerCase().includes(query.toLowerCase()) ||
                            (description && description.toLowerCase().includes(query.toLowerCase()))
                    ).map(({ id, title, description, icon: Icon, iconColor }, i) => (
                        <li
                            key={i}
                            className="list-group-item list-group-item-action py-3 pl-3 pr-2 position-relative d-flex align-items-center justify-content-between"
                        >
                            <div className="media">
                                {/* tslint:disable-next-line: jsx-ban-props */}
                                {Icon && <Icon className="mr-3 icon-inline h3 mb-0" style={{ color: iconColor }} />}
                                <div className="media-body">
                                    <Link
                                        to="TODO!(sqs)"
                                        className="stretched-link mb-0 text-decoration-none d-flex align-items-center text-body"
                                    >
                                        {title}
                                    </Link>
                                    {description && <p className="mb-0 small">{description}</p>}
                                </div>
                            </div>
                            <ChevronRightIcon className="icon-inline" />
                        </li>
                    ))}
                </ul>
            </ModalPage>
        </>
    )
}
