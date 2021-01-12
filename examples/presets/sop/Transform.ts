import {TransformSopNode} from '../../../src/engine/nodes/sop/Transform';

export function TransformSopNodePresets() {
	return {
		center_to_origin: function (node: TransformSopNode) {
			node.p.t.set(['-$CEX', '-$CEY', '-$CEZ']);
		},
	};
}
