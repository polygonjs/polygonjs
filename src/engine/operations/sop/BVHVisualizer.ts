import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {MeshBVHVisualizer} from './utils/Bvh/three-mesh-bvh';
import {Mesh} from 'three/src/objects/Mesh';

interface BVHVisualizerSopParams extends DefaultOperationParams {
	depth: number;
}

export class BVHVisualizerSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: BVHVisualizerSopParams = {
		depth: 0,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'BVHVisualizer'> {
		return 'BVHVisualizer';
	}
	override cook(input_contents: CoreGroup[], params: BVHVisualizerSopParams) {
		const coreGroup = input_contents[0];
		const object = coreGroup.objects()[0] as Mesh;
		const visualizer = new MeshBVHVisualizer(object, params.depth);
		visualizer.opacity = 1;
		visualizer.update();

		return this.createCoreGroupFromObjects([visualizer]);
	}
}
