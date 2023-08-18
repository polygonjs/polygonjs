import {DEFAULT_UV_LIGHT_MAP_ATTRIB_NAME} from '../../../src/engine/nodes/cop/utils/lightMap/LightMapMaterial';
import {UvUnwrapSopNode} from '../../../src/engine/nodes/sop/UvUnwrap';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const uvUnwrapSopNodePresetsCollectionFactory: PresetsCollectionFactory<UvUnwrapSopNode> = (node: UvUnwrapSopNode) => {
	const collection = new NodePresetsCollection();

	const lightMap = new BasePreset().addEntry(node.p.uv, DEFAULT_UV_LIGHT_MAP_ATTRIB_NAME);

	collection.setPresets({
		lightMap,
	});

	return collection;
};
export const roundedBoxSopPresetRegister: PresetRegister<typeof UvUnwrapSopNode, UvUnwrapSopNode> = {
	nodeClass: UvUnwrapSopNode,
	setupFunc: uvUnwrapSopNodePresetsCollectionFactory,
};
