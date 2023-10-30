import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {OnObjectSwipeJsNode} from '../../../src/engine/nodes/js/OnObjectSwipe';
import {OnObjectSwipeGPUJsNode} from '../../../src/engine/nodes/js/OnObjectSwipeGPU';
import {ANGLE_DEGREES} from '../../../src/engine/scene/utils/actors/rayObjectIntersection/RayObjectIntersectionsSwipeController';

type SwipeNode = OnObjectSwipeJsNode | OnObjectSwipeGPUJsNode;

const onObjectSwipeJsNodePresetsCollectionFactory: PresetsCollectionFactory<SwipeNode> = (node: SwipeNode) => {
	const collection = new NodePresetsCollection();

	const left = new BasePreset().addEntry(node.p.angle, ANGLE_DEGREES.LEFT);
	const right = new BasePreset().addEntry(node.p.angle, ANGLE_DEGREES.RIGHT);
	const up = new BasePreset().addEntry(node.p.angle, ANGLE_DEGREES.UP);
	const down = new BasePreset().addEntry(node.p.angle, ANGLE_DEGREES.DOWN);

	collection.setPresets({
		left,
		right,
		up,
		down,
	});

	return collection;
};
export const onObjectSwipeJsPresetRegister: PresetRegister<typeof OnObjectSwipeJsNode, OnObjectSwipeJsNode> = {
	nodeClass: OnObjectSwipeJsNode,
	setupFunc: onObjectSwipeJsNodePresetsCollectionFactory,
};
export const onObjectSwipeGPUJsPresetRegister: PresetRegister<typeof OnObjectSwipeGPUJsNode, OnObjectSwipeGPUJsNode> = {
	nodeClass: OnObjectSwipeGPUJsNode,
	setupFunc: onObjectSwipeJsNodePresetsCollectionFactory,
};
