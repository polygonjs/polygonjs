import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {DataUrlSopNode} from '../../../src/engine/nodes/sop/DataUrl';

export function DataUrlSopNodePresets() {
	return {
		basic: function (node: DataUrlSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/nodes/sop/DataUrl/basic.json`);
		},
		default: function (node: DataUrlSopNode) {
			node.p.url.set(`${DEMO_ASSETS_ROOT_URL}/nodes/sop/DataUrl/default.json`);
		},
	};
}
