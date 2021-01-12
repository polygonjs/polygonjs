import {AttributeGlNode, ATTRIBUTE_NODE_AVAILABLE_GL_TYPES} from '../../../src/engine/nodes/gl/Attribute';
import {GlConnectionPointType} from '../../../src/engine/nodes/utils/io/connections/Gl';

export function AttributeGlNodePresets() {
	return {
		color: function (node: AttributeGlNode) {
			node.p.name.set('color');
			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
		},
		instanceOrientation: function (node: AttributeGlNode) {
			node.p.name.set('instanceOrientation');
			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
		},
		instancePosition: function (node: AttributeGlNode) {
			node.p.name.set('instancePosition');
			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
		},
		instanceScale: function (node: AttributeGlNode) {
			node.p.name.set('instanceScale');
			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
		},
		position: function (node: AttributeGlNode) {
			node.p.name.set('position');
			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
		},
		uv: function (node: AttributeGlNode) {
			node.p.name.set('uv');
			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC2));
		},
		id: function (node: AttributeGlNode) {
			node.p.name.set('id');
			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.FLOAT));
		},
	};
}
