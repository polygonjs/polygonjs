import {EvaluatorMethodName} from '../../../nodes/js/code/assemblers/actor/Evaluator';
import {PolyScene} from '../../PolyScene';
import {ActorsManager, ActorBuilderNode} from '../ActorsManager';

export class ActorManualTriggersController {
	private _scene: PolyScene;
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	runTriggerFromFunctionNode(node: ActorBuilderNode, methodName: string) {
		this._scene.threejsScene().traverse((object) => {
			const nodeIds = this.actorsManager.objectActorNodeIds(object);
			if (nodeIds && nodeIds.includes(node.graphNodeId())) {
				this.actorsManager.triggerEventNode(node, object, methodName as EvaluatorMethodName);
			}
		});
	}
}
