import {BaseUserInputActorNodeType} from '../../../nodes/actor/_BaseUserInput';
import {PolyScene} from '../../PolyScene';
import {ActorsManager} from '../ActorsManager';

export class ActorPointerEventsController {
	private _scene: PolyScene;
	private _triggeredNodes: Set<BaseUserInputActorNodeType> = new Set();
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	setTriggeredNodes(nodes: Set<BaseUserInputActorNodeType>) {
		nodes.forEach((node) => {
			this._triggeredNodes.add(node);
		});
	}

	runTriggers() {
		this._triggeredNodes.forEach((triggeredNode) => {
			const triggeredNodeParent = this._triggeredNodeParent(triggeredNode);
			if (!triggeredNodeParent) {
				return;
			}

			const nodeParentId = triggeredNodeParent.graphNodeId();
			this._scene.threejsScene().traverse((object) => {
				const nodeIds = this.actorsManager.objectActorNodeIds(object);
				if (!nodeIds) {
					return;
				}
				if (!nodeIds.includes(nodeParentId)) {
					return;
				}
				triggeredNode.receiveTrigger({Object3D: object});
			});
		});

		this._triggeredNodes.clear();
	}

	private _triggeredNodeParent(node: BaseUserInputActorNodeType) {
		return this.actorsManager.parentActorBuilderNode(node);
	}
}
