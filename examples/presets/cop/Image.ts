import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {ImageCopNode} from '../../../src/engine/nodes/cop/Image';

export function ImageCopNodePresets() {
	return {
		asphalt: function (node: ImageCopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/textures/asphalt.jpg`);
		},
		disk: function (node: ImageCopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/textures/disk.png`);
		},
		envMap: function (node: ImageCopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/textures/piz_compressed.exr`);
		},
		uv: function (node: ImageCopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/textures/uv.jpg`);
		},
	};
}
