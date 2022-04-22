import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {MeshBVHVisualizer} from './utils/Bvh/three-mesh-bvh';
import {Mesh} from 'three';
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
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'BVHVisualizer'> {
		return 'BVHVisualizer';
	}
	override cook(input_contents: CoreGroup[], params: BVHVisualizerSopParams) {
		const coreGroup = input_contents[0];
		const object = coreGroup.objects()[0] as Mesh;
		const visualizer = new MeshBVHVisualizer(object, params.depth);
		visualizer.opacity = params.opacity;
		visualizer.displayEdges = params.displayEdges;
		visualizer.displayParents = params.displayParents;
		visualizer.update();

		return this.createCoreGroupFromObjects([visualizer]);
	}
}
