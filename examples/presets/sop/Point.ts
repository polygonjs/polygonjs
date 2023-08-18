import {PointSopNode} from '../../../src/engine/nodes/sop/Point';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {DEFAULT_UV_LIGHT_MAP_ATTRIB_NAME} from '../../../src/engine/nodes/cop/utils/lightMap/LightMapMaterial';

const pointSopNodePresetsCollectionFactory: PresetsCollectionFactory<PointSopNode> = (node: PointSopNode) => {
	const collection = new NodePresetsCollection();

	const UvToPosition = new BasePreset()
		.addEntry(node.p.updateX, true)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, true)
		.addEntry(node.p.x, '@uv.x')
		.addEntry(node.p.y, '@uv.y')
		.addEntry(node.p.z, 0);

	const UvLightMapToPosition = new BasePreset()
		.addEntry(node.p.updateX, true)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, true)
		.addEntry(node.p.x, `@${DEFAULT_UV_LIGHT_MAP_ATTRIB_NAME}.x`)
		.addEntry(node.p.y, `@${DEFAULT_UV_LIGHT_MAP_ATTRIB_NAME}.y`)
		.addEntry(node.p.z, 0);

	const wave = new BasePreset()
		.addEntry(node.p.updateX, false)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, false)
		.addEntry(node.p.y, 'sin(@P.z)');

	const animatedWave = new BasePreset()
		.addEntry(node.p.updateX, false)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, false)
		.addEntry(node.p.y, 'sin(@P.z + 2*$T)');

	collection.setPresets({
		UvToPosition,
		UvLightMapToPosition,
		wave,
		animatedWave,
	});

	return collection;
};
export const pointSopPresetRegister: PresetRegister<typeof PointSopNode, PointSopNode> = {
	nodeClass: PointSopNode,
	setupFunc: pointSopNodePresetsCollectionFactory,
};
