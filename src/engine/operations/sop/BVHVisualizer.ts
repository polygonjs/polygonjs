import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {MeshBVHHelper} from '../../../core/geometry/bvh/three-mesh-bvh';
import {Mesh, Object3D} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';

interface BVHVisualizerSopParams extends DefaultOperationParams {
	depth: number;
	opacity: number;
	displayEdges: boolean;
	displayParents: boolean;
}

export class BVHVisualizerSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BVHVisualizerSopParams = {
		depth: 0,
		opacity: 0.2,
		displayEdges: true,
		displayParents: false,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.ALWAYS;
	static override type(): Readonly<'BVHVisualizer'> {
		return 'BVHVisualizer';
	}
	override cook(inputCoreGroups: CoreGroup[], params: BVHVisualizerSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const objects = inputCoreGroup.threejsObjects();
		const newObjects: Object3D[] = [];
		for (let object of objects) {
			newObjects.push(object);
			object.traverse((childObject) => {
				const mesh = childObject as Mesh;
				if (mesh.isMesh) {
					const visualizer = new MeshBVHHelper(mesh, params.depth);
					visualizer.opacity = params.opacity;
					visualizer.depth = params.depth;
					visualizer.displayEdges = params.displayEdges;
					visualizer.displayParents = params.displayParents;
					visualizer.update();

					const parent = mesh.parent;
					if (parent) {
						parent.add(visualizer);
					} else {
						newObjects.push(visualizer);
					}
					mesh.geometry.drawRange.count = 0;
					// we don't want to hide the mesh, as it could have children
					// mesh.visible = false;
				}
			});
		}

		return this.createCoreGroupFromObjects(newObjects);
	}
}
