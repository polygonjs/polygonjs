import {ManualTriggerActorNode} from '../../../nodes/actor/ManualTrigger';
import {NodeContext} from '../../../poly/NodeContext';
import {ActorsManager} from '../ActorsManager';

export class SceneManualActorTriggersController {
	private _triggeredNode: ManualTriggerActorNode | undefined;
	constructor(protected actorsManager: ActorsManager) {}

	triggerWithNode(node: ManualTriggerActorNode) {
		this._triggeredNode = node;
	}
	triggered() {
		return this._triggeredNode != null;
	}
	triggeredNode() {
		return this._triggeredNode;
	}
	triggeredNodeParent() {
		if (!this._triggeredNode) {
			return;
		}
		return this._triggeredNode.parentController.findParent(
			(parent) => parent.childrenControllerContext() == NodeContext.ACTOR
		);
	}
	reset() {
		this._triggeredNode = undefined;
	}
}
