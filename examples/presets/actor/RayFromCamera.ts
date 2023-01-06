import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {RayFromCameraActorNode} from '../../../src/engine/nodes/actor/RayFromCamera';

const rayFromCameraActorNodePresetsCollectionFactory: PresetsCollectionFactory<RayFromCameraActorNode> = (
	node: RayFromCameraActorNode
) => {
	const collection = new NodePresetsCollection();

	const center = new BasePreset().addEntry(node.p.x, 0).addEntry(node.p.y, 0);
	const bottomLeft = new BasePreset().addEntry(node.p.x, -1).addEntry(node.p.y, -1);
	const topLeft = new BasePreset().addEntry(node.p.x, -1).addEntry(node.p.y, 1);
	const bottomRight = new BasePreset().addEntry(node.p.x, 1).addEntry(node.p.y, 1);
	const topRight = new BasePreset().addEntry(node.p.x, 1).addEntry(node.p.y, -1);

	collection.setPresets({
		center,
		bottomLeft,
		topLeft,
		bottomRight,
		topRight,
	});

	return collection;
};
export const rayFromCameraActorPresetRegister: PresetRegister<typeof RayFromCameraActorNode, RayFromCameraActorNode> = {
	nodeClass: RayFromCameraActorNode,
	setupFunc: rayFromCameraActorNodePresetsCollectionFactory,
};
