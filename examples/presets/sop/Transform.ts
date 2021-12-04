import {TransformSopNode} from '../../../src/engine/nodes/sop/Transform';

export function TransformSopNodePresets() {
	return {
		onGround: function (node: TransformSopNode) {
			node.p.t.y.set(`-bbox(0, 'min').y`);
		},
		centerToOrigin: function (node: TransformSopNode) {
			node.p.t.set(['-$CEX', '-$CEY', '-$CEZ']);
		},
		scaleTo1: function (node: TransformSopNode) {
			node.p.scale.set('1/bbox(0,"size").x');
		},
	};
}
