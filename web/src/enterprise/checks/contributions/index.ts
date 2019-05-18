import H from 'history'
import { Subscription, Unsubscribable } from 'rxjs'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import { registerChecksSearchContributions } from './search'

export function registerChecksContributions({
    history,
    extensionsController,
}: {
    history: H.History
} & ExtensionsControllerProps<'services'>): Unsubscribable {
    const subscriptions = new Subscription()
    subscriptions.add(registerChecksSearchContributions({ history, extensionsController }))
    return subscriptions
}
