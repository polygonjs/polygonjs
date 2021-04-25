import {PointSopNode} from '../../../src/engine/nodes/sop/Point';

export function PointSopNodePresets() {
	return {
		UvToPosition: function (node: PointSopNode) {
			node.p.updateX.set(true);
			node.p.updateY.set(true);
			node.p.updateZ.set(true);
			node.p.x.set('@uv.x');
			node.p.y.set('@uv.y');
			node.p.z.set(0);
		},
	};
}
