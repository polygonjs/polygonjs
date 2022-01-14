import {ColorSopNode} from '../../../src/engine/nodes/sop/Color';
import {BasePreset, NodePresetsCollection, PresetsCollectionFactory} from '../BasePreset';

// export function ColorSopNodePresets() {
// 	return {
// 		fromColor: function (node: ColorSopNode) {
// 			node.p.color.set(['@Cd.r', '@Cd.g', '@Cd.b']);
// 		},
// 		fromPosition: function (node: ColorSopNode) {
// 			node.p.color.set(['@P.x', '@P.y', '@P.z']);
// 		},
// 	};
// }

const colorSopNodePresetsCollectionFactory: PresetsCollectionFactory<ColorSopNode> = (node: ColorSopNode) => {
	const collection = new NodePresetsCollection();

	const fromColor = new BasePreset().addEntry(node.p.color, ['@Cd.r', '@Cd.g', '@Cd.b']);
	const fromPosition = new BasePreset().addEntry(node.p.color, ['@P.x', '@P.y', '@P.z']);
	collection.setPresets({
		fromColor,
		fromPosition,
	});

	return collection;
};
export {ColorSopNode, colorSopNodePresetsCollectionFactory};
