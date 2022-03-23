import {BaseActorNodeType} from '../../../nodes/actor/_Base';
import {PolyScene} from '../../PolyScene';
import {ActorsManager} from '../ActorsManager';

export class ActorManualTriggersController {
	private _nodeToRunTriggerFrom: BaseActorNodeType | undefined;
	private _nodeToReceiveTrigger: BaseActorNodeType | undefined;
	private _scene: PolyScene;
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	runTriggers() {
		if (!this._triggered()) {
			return;
		}
		const triggeredNodeParent = this._triggeredNodeParent();
		if (!triggeredNodeParent) {
			return;
		}
		const nodeToRunTriggerFrom = this._nodeToRunTriggerFrom;
		const nodeToReceiveTrigger = this._nodeToReceiveTrigger;

		this._reset();

		const nodeParentId = triggeredNodeParent.graphNodeId();
		this._scene.threejsScene().traverse((object) => {
			const nodeIds = this.actorsManager.objectActorNodeIds(object);
			if (!nodeIds) {
				return;
			}
			if (!nodeIds.includes(nodeParentId)) {
				return;
			}
			if (nodeToRunTriggerFrom) {
				nodeToRunTriggerFrom.runTrigger({Object3D: object});
			}
			if (nodeToReceiveTrigger) {
				nodeToReceiveTrigger.receiveTrigger({Object3D: object});
			}
		});
	}

	setNodeToRunTriggerFrom(node: BaseActorNodeType) {
		this._nodeToRunTriggerFrom = node;
	}
	setNodeToReceiveTrigger(node: BaseActorNodeType) {
		this._nodeToReceiveTrigger = node;
	}
	private _triggered() {
		return this._nodeToRunTriggerFrom != null || this._nodeToReceiveTrigger != null;
	}
	// nodeToRunTriggerFrom() {
	// 	return this._nodeToRunTriggerFrom;
	// }
	// nodeToReceiveTrigger() {
	// 	return this._nodeToReceiveTrigger;
	// }
	private _triggeredNodeParent() {
		const node = this._nodeToRunTriggerFrom || this._nodeToReceiveTrigger;
		if (!node) {
			return;
		}
		return this.actorsManager.parentActorBuilderNode(node);
	}
	private _reset() {
		this._nodeToRunTriggerFrom = undefined;
		this._nodeToReceiveTrigger = undefined;
	}
}
