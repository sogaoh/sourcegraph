import MapSearchIcon from 'mdi-react/MapSearchIcon'
import React, { useEffect } from 'react'
import { Route, RouteComponentProps, Switch } from 'react-router'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import { HeroPage } from '../../../components/HeroPage'
import { registerDiscussionsContributions } from '../../../repo/blob/discussions/contributions'
import { ThreadArea } from '../detail/ThreadArea'
import { NewThreadPage } from '../new/NewThreadPage'
import { ThreadKind } from '../util'
import { ThreadsManageArea } from './manage/ThreadsManageArea'
import { ThreadsOverviewPage } from './ThreadsOverviewPage'

const NotFoundPage: React.FunctionComponent = () => (
    <HeroPage icon={MapSearchIcon} title="404: Not Found" subtitle={`Sorry, the requested page was not found.`} />
)

/**
 * Properties passed to all page components in the threads area.
 */
export interface ThreadsAreaContext extends ExtensionsControllerProps {
    kind: ThreadKind
    isLightTheme: boolean
}

export interface ThreadsAreaProps
    extends Pick<ThreadsAreaContext, Exclude<keyof ThreadsAreaContext, 'kind'>>,
        Partial<Pick<ThreadsAreaContext, 'kind'>>,
        RouteComponentProps<{}>,
        ExtensionsControllerProps {}

/**
 * The global threads area.
 */
export const ThreadsArea: React.FunctionComponent<ThreadsAreaProps> = ({ match, ...props }) => {
    useEffect(() => {
        const subscription = registerDiscussionsContributions(props)
        return () => subscription.unsubscribe()
    }, [])

    const context: ThreadsAreaContext = {
        ...props,
        kind: props.kind || 'thread',
    }

    return (
        <div className="threads-area area--vertical pt-0">
            <Switch>
                <Route
                    path={match.url}
                    key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                    exact={true}
                    // tslint:disable-next-line:jsx-no-lambda
                    render={routeComponentProps => <ThreadsOverviewPage {...routeComponentProps} {...context} />}
                />
                <Route
                    path={`${match.url}/-/new`}
                    key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                    // tslint:disable-next-line:jsx-no-lambda
                    render={routeComponentProps => <NewThreadPage {...routeComponentProps} {...context} />}
                />
                <Route
                    path={`${match.url}/-/manage`}
                    key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                    // tslint:disable-next-line:jsx-no-lambda
                    render={routeComponentProps => <ThreadsManageArea {...routeComponentProps} {...context} />}
                />
                <Route
                    path={`${match.url}/:threadID`}
                    key="hardcoded-key" // see https://github.com/ReactTraining/react-router/issues/4578#issuecomment-334489490
                    // tslint:disable-next-line:jsx-no-lambda
                    render={routeComponentProps => <ThreadArea {...routeComponentProps} {...context} />}
                />
                <Route key="hardcoded-key" component={NotFoundPage} />
            </Switch>
        </div>
    )
}
