import {RoundedBoxSopNode} from '../../../src/engine/nodes/sop/RoundedBox';

export function RoundedBoxSopNodePresets() {
	return {
		playerCapsule: function (node: RoundedBoxSopNode) {
			node.p.size.set([1, 2, 1]);
			node.p.divisions.set(10);
			node.p.bevel.set(0.5);
			node.p.center.set([0, -0.5, 0]);
		},
	};
}
