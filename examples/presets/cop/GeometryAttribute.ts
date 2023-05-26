import {Attribute} from '../../../src/core/geometry/Attribute';
import {InstanceAttrib} from '../../../src/core/geometry/Instancer';
import {AttribLookup} from '../../../src/core/geometry/operation/TextureFromAttribute';
import {GeometryAttributeCopNode} from '../../../src/engine/nodes/cop/GeometryAttribute';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const GeometryAttributeCopNodePresetsCollectionFactory: PresetsCollectionFactory<GeometryAttributeCopNode> = (
	node: GeometryAttributeCopNode
) => {
	const collection = new NodePresetsCollection();

	const color = new BasePreset().addEntry(node.p.attribute, Attribute.COLOR);
	const instanceColor = new BasePreset().addEntry(node.p.attribute, InstanceAttrib.COLOR);
	const instanceQuaternion = new BasePreset().addEntry(node.p.attribute, InstanceAttrib.QUATERNION);
	const instancePosition = new BasePreset().addEntry(node.p.attribute, InstanceAttrib.POSITION);
	const instanceScale = new BasePreset().addEntry(node.p.attribute, InstanceAttrib.SCALE);
	const instanceUv = new BasePreset().addEntry(node.p.attribute, InstanceAttrib.UV);
	const position = new BasePreset().addEntry(node.p.attribute, Attribute.POSITION);
	const normal = new BasePreset().addEntry(node.p.attribute, Attribute.NORMAL);
	const uv = new BasePreset().addEntry(node.p.attribute, Attribute.UV);
	const id = new BasePreset().addEntry(node.p.attribute, `id`);
	const idn = new BasePreset().addEntry(node.p.attribute, `idn`);
	const pti = new BasePreset().addEntry(node.p.attribute, `pti`);
	// const randomId = new BasePreset().addEntry(node.p.name, `randomId`);
	const restP = new BasePreset().addEntry(node.p.attribute, `restP`);
	const restN = new BasePreset().addEntry(node.p.attribute, `restN`);
	const velocity = new BasePreset().addEntry(node.p.attribute, `velocity`);
	const attribLookupId = new BasePreset().addEntry(node.p.attribute, AttribLookup.ID);
	const attribLookupUv = new BasePreset().addEntry(node.p.attribute, AttribLookup.UV);

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
		attribLookupId,
		attribLookupUv,
	});

	return collection;
};
export const geometryAttributeCopPresetRegister: PresetRegister<
	typeof GeometryAttributeCopNode,
	GeometryAttributeCopNode
> = {
	nodeClass: GeometryAttributeCopNode,
	setupFunc: GeometryAttributeCopNodePresetsCollectionFactory,
};
