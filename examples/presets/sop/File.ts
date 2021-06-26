import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {FileSopNode} from '../../../src/engine/nodes/sop/File';

export function FileSopNodePresets() {
	return {
		bunny_drc: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/bunny.drc`);
		},
		bunny_fbx: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/fbx/stanford-bunny.fbx`);
		},
		car_glb: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/car.glb`);
		},
		deer_obj: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/deer.obj`);
		},
		flamingo_glb: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/flamingo.glb`);
		},
		parrot_glb: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/parrot.glb`);
		},
		soldier_glb: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/soldier.glb`);
		},
		wolf_obj: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/wolf.obj`);
		},
		dolphin_obj: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/dolphin.obj`);
		},
		sphere_with_texture: function (node: FileSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/models/sphere_with_texture.glb`);
		},
	};
}
