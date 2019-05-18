import * as H from 'history'
import BellIcon from 'mdi-react/BellIcon'
import * as React from 'react'
import { Subscription } from 'rxjs'
import { ContributableMenu } from '../../../shared/src/api/protocol'
import { ActivationProps } from '../../../shared/src/components/activation/Activation'
import { ActivationDropdown } from '../../../shared/src/components/activation/ActivationDropdown'
import { Link } from '../../../shared/src/components/Link'
import { ExtensionsControllerProps } from '../../../shared/src/extensions/controller'
import * as GQL from '../../../shared/src/graphql/schema'
import { PlatformContextProps } from '../../../shared/src/platform/context'
import { SettingsCascadeProps } from '../../../shared/src/settings/settings'
import { LinkWithIconOnlyTooltip } from '../components/LinkWithIconOnlyTooltip'
import { WebActionsNavItems, WebCommandListPopoverButton } from '../components/shared'
import { isDiscussionsEnabled } from '../discussions'
import { ChangesIcon } from '../enterprise/changes/icons'
import { ChecksIcon } from '../enterprise/checks/icons'
import { CodemodIcon } from '../enterprise/codemod/icons'
import { ThreadsNavItem } from '../enterprise/threads/global/nav/ThreadsNavItem'
import { KeybindingsProps } from '../keybindings'
import { ThemePreferenceProps, ThemeProps } from '../theme'
import { EventLoggerProps } from '../tracking/eventLogger'
import { UserNavItem } from './UserNavItem'

interface Props
    extends SettingsCascadeProps,
        KeybindingsProps,
        ExtensionsControllerProps<'executeCommand' | 'services'>,
        PlatformContextProps<'forceUpdateTooltip'>,
        ThemeProps,
        ThemePreferenceProps,
        EventLoggerProps,
        ActivationProps {
    location: H.Location
    history: H.History
    authenticatedUser: GQL.IUser | null
    showDotComMarketing: boolean
}

export class NavLinks extends React.PureComponent<Props> {
    private subscriptions = new Subscription()

    public componentWillUnmount(): void {
        this.subscriptions.unsubscribe()
    }

    public render(): JSX.Element | null {
        return (
            <ul className="nav-links nav align-items-center pl-2 pr-1">
                {/* Show "Search" link on small screens when GlobalNavbar hides the SearchNavbarItem. */}
                {this.props.location.pathname !== '/search' && this.props.location.pathname !== '/welcome' && (
                    <li className="nav-item d-sm-none">
                        <Link className="nav-link" to="/search">
                            Search
                        </Link>
                    </li>
                )}
                {this.props.showDotComMarketing && this.props.location.pathname !== '/welcome' && (
                    <li className="nav-item">
                        <Link to="/welcome" className="nav-link">
                            Welcome
                        </Link>
                    </li>
                )}
                {this.props.showDotComMarketing && this.props.location.pathname === '/welcome' && (
                    <li className="nav-item">
                        <a href="https://docs.sourcegraph.com" className="nav-link" target="_blank">
                            Docs
                        </a>
                    </li>
                )}
                <WebActionsNavItems {...this.props} menu={ContributableMenu.GlobalNav} />
                {this.props.activation && (
                    <li className="nav-item">
                        <ActivationDropdown activation={this.props.activation} history={this.props.history} />
                    </li>
                )}
                {(!this.props.showDotComMarketing ||
                    !!this.props.authenticatedUser ||
                    this.props.location.pathname !== '/welcome') && (
                    // TODO!(sqs): only show these on enterprise
                    <>
                        <li className="nav-item">
                            <LinkWithIconOnlyTooltip
                                to="/notifications"
                                text="Notifications"
                                icon={BellIcon}
                                className="nav-link btn btn-link px-3 text-decoration-none"
                            />
                        </li>
                        <li className="nav-item">
                            <LinkWithIconOnlyTooltip
                                to="/checks"
                                text="Checks"
                                tooltip="Checks (alerts & automation)"
                                icon={ChecksIcon}
                                className="nav-link btn btn-link px-3 text-decoration-none"
                            />
                        </li>
                        <li className="nav-item">
                            <LinkWithIconOnlyTooltip
                                to="/codemods"
                                text="Codemods"
                                icon={CodemodIcon}
                                className="nav-link btn btn-link px-3 text-decoration-none"
                            />
                        </li>
                        <li className="nav-item">
                            <ThreadsNavItem className="px-3" />
                        </li>
                        <li className="nav-item d-none">
                            <LinkWithIconOnlyTooltip
                                to="/changes"
                                text="Changes"
                                icon={ChangesIcon}
                                className="nav-link btn btn-link px-3 text-decoration-none"
                            />
                        </li>
                    </>
                )}
                {!this.props.authenticatedUser && (
                    <>
                        {this.props.location.pathname !== '/welcome' && (
                            <li className="nav-item">
                                <Link to="/extensions" className="nav-link">
                                    Extensions
                                </Link>
                            </li>
                        )}
                        {this.props.location.pathname !== '/sign-in' && (
                            <li className="nav-item mx-1">
                                <Link className="nav-link btn btn-primary" to="/sign-in">
                                    Sign in
                                </Link>
                            </li>
                        )}
                        {this.props.showDotComMarketing && (
                            <li className="nav-item">
                                <a href="https://about.sourcegraph.com" className="nav-link">
                                    About
                                </a>
                            </li>
                        )}
                        {this.props.location.pathname !== '/welcome' && (
                            <li className="nav-item">
                                <Link to="/help" className="nav-link">
                                    Help
                                </Link>
                            </li>
                        )}
                    </>
                )}
                {this.props.authenticatedUser && (
                    <li className="nav-item">
                        <UserNavItem
                            {...this.props}
                            authenticatedUser={this.props.authenticatedUser}
                            showDotComMarketing={this.props.showDotComMarketing}
                            showDiscussions={isDiscussionsEnabled(this.props.settingsCascade)}
                        />
                    </li>
                )}
                {this.props.location.pathname !== '/welcome' && (
                    <WebCommandListPopoverButton
                        {...this.props}
                        className="nav-item"
                        menu={ContributableMenu.CommandPalette}
                        toggleVisibilityKeybinding={this.props.keybindings.commandPalette}
                    />
                )}
            </ul>
        )
    }
}
