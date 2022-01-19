import {PointSopNode} from '../../../src/engine/nodes/sop/Point';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

// export function PointSopNodePresets() {
// 	return {
// 		UvToPosition: function (node: PointSopNode) {
// 			node.p.updateX.set(true);
// 			node.p.updateY.set(true);
// 			node.p.updateZ.set(true);
// 			node.p.x.set('@uv.x');
// 			node.p.y.set('@uv.y');
// 			node.p.z.set(0);
// 		},
// 	};
// }

const pointSopNodePresetsCollectionFactory: PresetsCollectionFactory<PointSopNode> = (node: PointSopNode) => {
	const collection = new NodePresetsCollection();

	const UvToPosition = new BasePreset()
		.addEntry(node.p.updateX, true)
		.addEntry(node.p.updateY, true)
		.addEntry(node.p.updateZ, true)
		.addEntry(node.p.x, '@uv.x')
		.addEntry(node.p.y, '@uv.y')
		.addEntry(node.p.z, 0);

	collection.setPresets({
		UvToPosition,
	});

	return collection;
};
export const pointSopPresetRegister: PresetRegister<typeof PointSopNode, PointSopNode> = {
	nodeClass: PointSopNode,
	setupFunc: pointSopNodePresetsCollectionFactory,
};
