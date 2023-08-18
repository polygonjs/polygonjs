import {Attribute} from '../../../src/core/geometry/Attribute';
import {InstanceAttrib} from '../../../src/core/geometry/Instancer';
import {AttribLookup} from '../../../src/core/geometry/operation/TextureFromAttribute';
import {GlobalsTextureHandler} from '../../../src/engine/nodes/gl/code/globals/Texture';
import {AttributeJsNode, ATTRIBUTE_NODE_AVAILABLE_JS_TYPES} from '../../../src/engine/nodes/js/Attribute';
import {JsConnectionPointType} from '../../../src/engine/nodes/utils/io/connections/Js';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {DEFAULT_UV_LIGHT_MAP_ATTRIB_NAME} from '../../../src/engine/nodes/cop/utils/lightMap/LightMapMaterial';

const attributeJsNodePresetsCollectionFactory: PresetsCollectionFactory<AttributeJsNode> = (node: AttributeJsNode) => {
	const collection = new NodePresetsCollection();

	const f = ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.indexOf(JsConnectionPointType.FLOAT);
	const v2 = ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.indexOf(JsConnectionPointType.VECTOR2);
	const v3 = ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.indexOf(JsConnectionPointType.VECTOR3);
	const v4 = ATTRIBUTE_NODE_AVAILABLE_JS_TYPES.indexOf(JsConnectionPointType.VECTOR4);

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
	const uvLightMap = new BasePreset()
		.addEntry(node.p.name, DEFAULT_UV_LIGHT_MAP_ATTRIB_NAME)
		.addEntry(node.p.type, v2);
	const id = new BasePreset().addEntry(node.p.name, `id`).addEntry(node.p.type, f);
	const idn = new BasePreset().addEntry(node.p.name, `idn`).addEntry(node.p.type, f);
	const pti = new BasePreset().addEntry(node.p.name, `pti`).addEntry(node.p.type, f);
	// const randomId = new BasePreset().addEntry(node.p.name, `randomId`).addEntry(node.p.type, f);
	const restP = new BasePreset().addEntry(node.p.name, `restP`).addEntry(node.p.type, v3);
	const restN = new BasePreset().addEntry(node.p.name, `restN`).addEntry(node.p.type, v3);
	const velocity = new BasePreset().addEntry(node.p.name, `velocity`).addEntry(node.p.type, v3);
	const attribLookupId = new BasePreset().addEntry(node.p.name, AttribLookup.ID).addEntry(node.p.type, f);
	const attribLookupUv = new BasePreset().addEntry(node.p.name, AttribLookup.UV).addEntry(node.p.type, v2);
	const particlesSimUv = new BasePreset().addEntry(node.p.name, GlobalsTextureHandler.PARTICLES_SIM_UV_ATTRIB);

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
		uvLightMap,
		id,
		idn,
		pti,
		restP,
		restN,
		// randomId,
		velocity,
		attribLookupId,
		attribLookupUv,
		particlesSimUv,
	});

	return collection;
};
export const attributeJsPresetRegister: PresetRegister<typeof AttributeJsNode, AttributeJsNode> = {
	nodeClass: AttributeJsNode,
	setupFunc: attributeJsNodePresetsCollectionFactory,
};
