import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {FileSopNode} from '../../../src/engine/nodes/sop/File';

export function FileSopNodePresets() {
	return {
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
	};
}
