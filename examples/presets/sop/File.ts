import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {FileSopNode} from '../../../src/engine/nodes/sop/File';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

// export function FileSopNodePresets() {
// 	return {
// 		bunny_drc: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/bunny.drc`);
// 		},
// 		bunny_fbx: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/fbx/stanford-bunny.fbx`);
// 		},
// 		car_glb: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/car.glb`);
// 		},
// 		deer_obj: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/deer.obj`);
// 		},
// 		flamingo_glb: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/flamingo.glb`);
// 		},
// 		parrot_glb: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/parrot.glb`);
// 		},
// 		soldier_glb: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/soldier.glb`);
// 		},
// 		wolf_obj: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/wolf.obj`);
// 		},
// 		dolphin_obj: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/dolphin.obj`);
// 		},
// 		sphere_with_texture: function (node: FileSopNode) {
// 			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/sphere_with_texture.glb`);
// 		},
// 	};
// }

const fileSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileSopNode> = (node: FileSopNode) => {
	const collection = new NodePresetsCollection();

	const bunny_drc = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/bunny.drc`
	);
	const bunny_fbx = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/fbx/stanford-bunny.fbx`
	);
	const car_glb = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/car.glb`);
	const deer_obj = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/deer.obj`);
	const flamingo_glb = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/flamingo.glb`
	);
	const parrot_glb = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/parrot.glb`
	);
	const soldier_glb = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/soldier.glb`
	);
	const wolf_obj = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/wolf.obj`);
	const dolphin_obj = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/dolphin.obj`
	);
	const sphere_with_texture = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/sphere_with_texture.glb`
	);
	collection.setPresets({
		bunny_drc,
		bunny_fbx,
		car_glb,
		deer_obj,
		flamingo_glb,
		parrot_glb,
		soldier_glb,
		wolf_obj,
		dolphin_obj,
		sphere_with_texture,
	});

	return collection;
};

export const fileSopPresetRegister: PresetRegister<typeof FileSopNode, FileSopNode> = {
	nodeClass: FileSopNode,
	setupFunc: fileSopNodePresetsCollectionFactory,
};
