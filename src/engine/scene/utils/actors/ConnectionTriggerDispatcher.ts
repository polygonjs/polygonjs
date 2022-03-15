import {
	NODE_CONNECTION_TRIGGERED_EVENT,
	NODE_CONNECTION_UNTRIGGERED_EVENT,
	TypedNodeConnection,
} from '../../../nodes/utils/io/NodeConnection';
import {NodeContext} from '../../../poly/NodeContext';
import {ActorsManager} from '../ActorsManager';

export class SceneConnectionTriggerDispatcher {
	private _dispatchedConnections: Set<TypedNodeConnection<any>> = new Set();
	constructor(protected actorsManager: ActorsManager) {}

	dispatchTrigger<NC extends NodeContext>(connection: TypedNodeConnection<NC>) {
		connection._eventDispatcher()?.dispatchEvent(NODE_CONNECTION_TRIGGERED_EVENT);
		this._dispatchedConnections.add(connection);
	}
	reset() {
		this._dispatchedConnections.forEach((connection) => {
			connection._eventDispatcher()?.dispatchEvent(NODE_CONNECTION_UNTRIGGERED_EVENT);
		});

		this._dispatchedConnections.clear();
	}
}
