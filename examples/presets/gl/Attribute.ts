import {Attribute} from '../../../src/core/geometry/Attribute';
import {InstanceAttrib} from '../../../src/core/geometry/Instancer';
import {AttributeGlNode, ATTRIBUTE_NODE_AVAILABLE_GL_TYPES} from '../../../src/engine/nodes/gl/Attribute';
import {GlConnectionPointType} from '../../../src/engine/nodes/utils/io/connections/Gl';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const attributeGlNodePresetsCollectionFactory: PresetsCollectionFactory<AttributeGlNode> = (node: AttributeGlNode) => {
	const collection = new NodePresetsCollection();

	const f = ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.FLOAT);
	const v2 = ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC2);
	const v3 = ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC3);
	const v4 = ATTRIBUTE_NODE_AVAILABLE_GL_TYPES.indexOf(GlConnectionPointType.VEC4);

	const color = new BasePreset().addEntry(node.p.name, Attribute.COLOR).addEntry(node.p.type, v3);
	const instanceColor = new BasePreset().addEntry(node.p.name, InstanceAttrib.COLOR).addEntry(node.p.type, v3);
	const instanceQuaternion = new BasePreset()
		.addEntry(node.p.name, InstanceAttrib.QUATERNION)
		.addEntry(node.p.type, v4);
	const instancePosition = new BasePreset().addEntry(node.p.name, InstanceAttrib.POSITION).addEntry(node.p.type, v3);
	const instanceScale = new BasePreset().addEntry(node.p.name, InstanceAttrib.SCALE).addEntry(node.p.type, v3);
	const instanceUv = new BasePreset().addEntry(node.p.name, InstanceAttrib.UV).addEntry(node.p.type, v2);
	const position = new BasePreset().addEntry(node.p.name, Attribute.POSITION).addEntry(node.p.type, v3);
	const normal = new BasePreset().addEntry(node.p.name, Attribute.NORMAL).addEntry(node.p.type, v3);
	const uv = new BasePreset().addEntry(node.p.name, Attribute.UV).addEntry(node.p.type, v2);
	const id = new BasePreset().addEntry(node.p.name, `id`).addEntry(node.p.type, f);
	const idn = new BasePreset().addEntry(node.p.name, `idn`).addEntry(node.p.type, f);
	const pti = new BasePreset().addEntry(node.p.name, `pti`).addEntry(node.p.type, f);
	// const randomId = new BasePreset().addEntry(node.p.name, `randomId`).addEntry(node.p.type, f);
	const restP = new BasePreset().addEntry(node.p.name, `restP`).addEntry(node.p.type, v3);
	const restN = new BasePreset().addEntry(node.p.name, `restN`).addEntry(node.p.type, v3);
	const velocity = new BasePreset().addEntry(node.p.name, `velocity`).addEntry(node.p.type, v3);

	collection.setPresets({
		color,
		instanceColor,
		instanceQuaternion,
		instancePosition,
		instanceScale,
		instanceUv,
		position,
		normal,
		uv,
		id,
		idn,
		pti,
		restP,
		restN,
		// randomId,
		velocity,
	});

	return collection;
};
export const attributeGlPresetRegister: PresetRegister<typeof AttributeGlNode, AttributeGlNode> = {
	nodeClass: AttributeGlNode,
	setupFunc: attributeGlNodePresetsCollectionFactory,
};
