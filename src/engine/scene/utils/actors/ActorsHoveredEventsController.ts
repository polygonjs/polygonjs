import {ActorType} from '../../../poly/registers/nodes/types/Actor';
import {PolyScene} from '../../PolyScene';
import {ActorBuilderNode, ActorsManager} from '../ActorsManager';

export class ActorHoveredEventsController {
	private _scene: PolyScene;
	constructor(protected actorsManager: ActorsManager) {
		this._scene = actorsManager.scene;
	}

	runTriggers() {
		this._scene.threejsScene().traverse((object) => {
			const nodeIds = this.actorsManager.objectActorNodeIds(object);
			if (!nodeIds) {
				return;
			}
			for (let nodeId of nodeIds) {
				const node = this._scene.graph.nodeFromId(nodeId) as ActorBuilderNode | undefined;
				if (node) {
					const onEventNodes = node.nodesByType(ActorType.ON_OBJECT_HOVER);
					for (let onEventNode of onEventNodes) {
						onEventNode.receiveTrigger({Object3D: object});
					}
				}
			}
		});
	}
}
