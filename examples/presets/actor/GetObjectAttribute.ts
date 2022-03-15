import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {GetObjectAttributeActorNode} from '../../../src/engine/nodes/actor/GetObjectAttribute';
import {ObjectAttribute} from '../../../src/core/geometry/Attribute';
import {
	ActorConnectionPointType,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
} from '../../../src/engine/nodes/utils/io/connections/Actor';

const getObjectAttributeActorNodePresetsCollectionFactory: PresetsCollectionFactory<GetObjectAttributeActorNode> = (
	node: GetObjectAttributeActorNode
) => {
	const collection = new NodePresetsCollection();

	const b = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.BOOLEAN);

	const hovered = new BasePreset().addEntry(node.p.attribName, ObjectAttribute.HOVERED).addEntry(node.p.type, b);

	collection.setPresets({
		hovered,
	});

	return collection;
};
export const getObjectAttributeActorPresetRegister: PresetRegister<
	typeof GetObjectAttributeActorNode,
	GetObjectAttributeActorNode
> = {
	nodeClass: GetObjectAttributeActorNode,
	setupFunc: getObjectAttributeActorNodePresetsCollectionFactory,
};
