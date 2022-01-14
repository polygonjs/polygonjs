import {AttributeGlNode, ATTRIBUTE_NODE_AVAILABLE_GL_TYPES} from '../../../src/engine/nodes/gl/Attribute';
import {GlConnectionPointType} from '../../../src/engine/nodes/utils/io/connections/Gl';
import {BasePreset, NodePresetsCollection, PresetsCollectionFactory} from '../BasePreset';

// export function AttributeGlNodePresets() {
// 	return {
// 		// color: function (node: AttributeGlNode) {
// 		// 	node.p.name.set('color');
// 		// 	node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
// 		// },
// 		// instanceColor: function (node: AttributeGlNode) {
// 		// 	node.p.name.set('instanceColor');
// 		// 	node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
// 		// },
// 		instanceOrientation: function (node: AttributeGlNode) {
// 			node.p.name.set('instanceOrientation');
// 			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC4));
// 		},
// 		instancePosition: function (node: AttributeGlNode) {
// 			node.p.name.set('instancePosition');
// 			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
// 		},
// 		instanceScale: function (node: AttributeGlNode) {
// 			node.p.name.set('instanceScale');
// 			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
// 		},
// 		position: function (node: AttributeGlNode) {
// 			node.p.name.set('position');
// 			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3));
// 		},
// 		uv: function (node: AttributeGlNode) {
// 			node.p.name.set('uv');
// 			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC2));
// 		},
// 		id: function (node: AttributeGlNode) {
// 			node.p.name.set('id');
// 			node.p.type.set(ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.FLOAT));
// 		},
// 	};
// }

const attributeGlNodePresetsCollectionFactory: PresetsCollectionFactory<AttributeGlNode> = (node: AttributeGlNode) => {
	const collection = new NodePresetsCollection();

	const f = ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.FLOAT);
	const v2 = ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC2);
	const v3 = ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3);
	const v4 = ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC4);

	const color = new BasePreset().addEntry(node.p.name, `color`).addEntry(node.p.type, v3);
	const instanceColor = new BasePreset().addEntry(node.p.name, `instanceColor`).addEntry(node.p.type, v3);
	const instanceOrientation = new BasePreset().addEntry(node.p.name, `instanceOrientation`).addEntry(node.p.type, v4);
	const instancePosition = new BasePreset().addEntry(node.p.name, `instancePosition`).addEntry(node.p.type, v3);
	const instanceScale = new BasePreset().addEntry(node.p.name, `instanceScale`).addEntry(node.p.type, v3);
	const position = new BasePreset().addEntry(node.p.name, `position`).addEntry(node.p.type, v3);
	const uv = new BasePreset().addEntry(node.p.name, `uv`).addEntry(node.p.type, v2);
	const id = new BasePreset().addEntry(node.p.name, `position`).addEntry(node.p.type, f);

	collection.setPresets({
		color,
		instanceColor,
		instanceOrientation,
		instancePosition,
		instanceScale,
		position,
		uv,
		id,
	});

	return collection;
};
export {AttributeGlNode, attributeGlNodePresetsCollectionFactory};
