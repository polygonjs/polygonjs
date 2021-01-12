import {ColorSopNode} from '../../../src/engine/nodes/sop/Color';

export function ColorSopNodePresets() {
	return {
		fromColor: function (node: ColorSopNode) {
			node.p.color.set(['@Cd.r', '@Cd.g', '@Cd.b']);
		},
		fromPosition: function (node: ColorSopNode) {
			node.p.color.set(['@P.x', '@P.y', '@P.z']);
		},
	};
}
