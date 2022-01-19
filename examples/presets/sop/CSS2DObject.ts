import {CSS2DObjectSopNode} from '../../../src/engine/nodes/sop/CSS2DObject';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

// export function CSS2DObjectSopNodePresets() {
// 	return {
// 		smooth_transform: function (node: CSS2DObjectSopNode) {
// 			node.p.useHTMLAttrib.set(false);
// 			node.p.html.set(`<div style='will-change: transform;'>default html</div>`);
// 		},
// 		smooth_opacity: function (node: CSS2DObjectSopNode) {
// 			node.p.useHTMLAttrib.set(false);
// 			node.p.html.set("<div style='will-change: opacity;'>default html</div>");
// 		},
// 		smooth_opacity_and_transform: function (node: CSS2DObjectSopNode) {
// 			node.p.useHTMLAttrib.set(false);
// 			node.p.html.set("<div style='will-change: transform, opacity;'>default html</div>");
// 		},
// 	};
// }

const CSS2DObjectSopNodePresetsCollectionFactory: PresetsCollectionFactory<CSS2DObjectSopNode> = (
	node: CSS2DObjectSopNode
) => {
	const collection = new NodePresetsCollection();

	const smooth_transform = new BasePreset()
		.addEntry(node.p.useHTMLAttrib, false)
		.addEntry<ParamType.STRING>(node.p.html, `<div style='will-change: transform;'>default html</div>`);
	const smooth_opacity = new BasePreset()
		.addEntry(node.p.useHTMLAttrib, false)
		.addEntry<ParamType.STRING>(node.p.html, `<div style='will-change: opacity;'>default html</div>`);
	const smooth_opacity_and_transform = new BasePreset()
		.addEntry(node.p.useHTMLAttrib, false)
		.addEntry<ParamType.STRING>(node.p.html, `<div style='will-change: transform, opacity;'>default html</div>`);
	collection.setPresets({
		smooth_transform,
		smooth_opacity,
		smooth_opacity_and_transform,
	});

	return collection;
};
export const CSS2DObjectPresetRegister: PresetRegister<typeof CSS2DObjectSopNode, CSS2DObjectSopNode> = {
	nodeClass: CSS2DObjectSopNode,
	setupFunc: CSS2DObjectSopNodePresetsCollectionFactory,
};
