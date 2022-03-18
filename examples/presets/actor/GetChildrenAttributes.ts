import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {GetChildrenAttributesActorNode} from '../../../src/engine/nodes/actor/GetChildrenAttributes';
import {ObjectAttribute} from '../../../src/core/geometry/Attribute';
import {
	ActorConnectionPointType,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
} from '../../../src/engine/nodes/utils/io/connections/Actor';

const getChildrenAttributesActorNodePresetsCollectionFactory: PresetsCollectionFactory<
	GetChildrenAttributesActorNode
> = (node: GetChildrenAttributesActorNode) => {
	const collection = new NodePresetsCollection();

	const b = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.BOOLEAN);

	const hovered = new BasePreset().addEntry(node.p.attribName, ObjectAttribute.HOVERED).addEntry(node.p.type, b);

	collection.setPresets({
		hovered,
	});

	return collection;
};
export const getChildrenAttributesActorPresetRegister: PresetRegister<
	typeof GetChildrenAttributesActorNode,
	GetChildrenAttributesActorNode
> = {
	nodeClass: GetChildrenAttributesActorNode,
	setupFunc: getChildrenAttributesActorNodePresetsCollectionFactory,
};
