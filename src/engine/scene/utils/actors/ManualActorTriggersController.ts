import {BaseActorNodeType} from '../../../nodes/actor/_Base';
import {ActorsManager} from '../ActorsManager';

export class SceneManualActorTriggersController {
	private _nodeToRunTriggerFrom: BaseActorNodeType | undefined;
	private _nodeToReceiveTrigger: BaseActorNodeType | undefined;
	constructor(protected actorsManager: ActorsManager) {}

	setNodeToRunTriggerFrom(node: BaseActorNodeType) {
		this._nodeToRunTriggerFrom = node;
	}
	setNodeToReceiveTrigger(node: BaseActorNodeType) {
		this._nodeToReceiveTrigger = node;
	}
	triggered() {
		return this._nodeToRunTriggerFrom != null || this._nodeToReceiveTrigger != null;
	}
	nodeToRunTriggerFrom() {
		return this._nodeToRunTriggerFrom;
	}
	nodeToReceiveTrigger() {
		return this._nodeToReceiveTrigger;
	}
	triggeredNodeParent() {
		const node = this._nodeToRunTriggerFrom || this._nodeToReceiveTrigger;
		if (!node) {
			return;
		}
		return this.actorsManager.parentActorBuilderNode(node);
	}
	reset() {
		this._nodeToRunTriggerFrom = undefined;
		this._nodeToReceiveTrigger = undefined;
	}
}
