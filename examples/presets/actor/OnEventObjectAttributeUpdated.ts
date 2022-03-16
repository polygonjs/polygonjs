import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {OnEventObjectAttributeUpdatedActorNode} from '../../../src/engine/nodes/actor/OnEventObjectAttributeUpdated';
import {ObjectAttribute} from '../../../src/core/geometry/Attribute';
import {
	ActorConnectionPointType,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
} from '../../../src/engine/nodes/utils/io/connections/Actor';

const onObjectAttributeUpdatedActorNodePresetsCollectionFactory: PresetsCollectionFactory<
	OnEventObjectAttributeUpdatedActorNode
> = (node: OnEventObjectAttributeUpdatedActorNode) => {
	const collection = new NodePresetsCollection();

	const b = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.BOOLEAN);

	const hovered = new BasePreset().addEntry(node.p.attribName, ObjectAttribute.HOVERED).addEntry(node.p.type, b);

	collection.setPresets({
		hovered,
	});

	return collection;
};
export const onEventObjectAttributeUpdatedActorPresetRegister: PresetRegister<
	typeof OnEventObjectAttributeUpdatedActorNode,
	OnEventObjectAttributeUpdatedActorNode
> = {
	nodeClass: OnEventObjectAttributeUpdatedActorNode,
	setupFunc: onObjectAttributeUpdatedActorNodePresetsCollectionFactory,
};
