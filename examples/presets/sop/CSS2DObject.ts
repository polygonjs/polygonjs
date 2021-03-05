import {CSS2DObjectSopNode} from '../../../src/engine/nodes/sop/CSS2DObject';

export function CSS2DObjectSopNodePresets() {
	return {
		smooth_transform: function (node: CSS2DObjectSopNode) {
			node.p.useHtmlAttrib.set(false);
			node.p.html.set("<div style='will-change: transform;'>default html</div>");
		},
		smooth_opacity: function (node: CSS2DObjectSopNode) {
			node.p.useHtmlAttrib.set(false);
			node.p.html.set("<div style='will-change: opacity;'>default html</div>");
		},
		smooth_opacity_and_transform: function (node: CSS2DObjectSopNode) {
			node.p.useHtmlAttrib.set(false);
			node.p.html.set("<div style='will-change: transform, opacity;'>default html</div>");
		},
	};
}
