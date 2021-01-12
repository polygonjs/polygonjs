import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {VideoCopNode} from '../../../src/engine/nodes/cop/Video';

export function VideoCopNodePresets() {
	return {
		ogv: function (node: VideoCopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/textures/sintel.ogv`);
		},
		mp4: function (node: VideoCopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/textures/sintel.mp4`);
		},
	};
}
