import {NODE_CONNECTION_TRIGGERED_EVENT, TypedNodeConnection} from '../../../nodes/utils/io/NodeConnection';
import {NodeContext} from '../../../poly/NodeContext';

export class SceneConnectionTriggerDispatcher {
	// private _dispatchedConnections: Set<TypedNodeConnection<any>> = new Set();
	constructor() {}

	dispatchTrigger<NC extends NodeContext>(connection: TypedNodeConnection<NC>) {
		connection._eventDispatcher()?.dispatchEvent(NODE_CONNECTION_TRIGGERED_EVENT);
		// this._dispatchedConnections.add(connection);
	}
}
