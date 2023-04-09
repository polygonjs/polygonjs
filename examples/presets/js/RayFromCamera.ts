import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {RayFromCameraJsNode} from '../../../src/engine/nodes/js/RayFromCamera';

const rayFromCameraJsNodePresetsCollectionFactory: PresetsCollectionFactory<RayFromCameraJsNode> = (
	node: RayFromCameraJsNode
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
export const rayFromCameraJsPresetRegister: PresetRegister<typeof RayFromCameraJsNode, RayFromCameraJsNode> = {
	nodeClass: RayFromCameraJsNode,
	setupFunc: rayFromCameraJsNodePresetsCollectionFactory,
};
