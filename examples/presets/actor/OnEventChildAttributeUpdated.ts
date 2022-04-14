import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {OnChildAttributeUpdateActorNode} from '../../../src/engine/nodes/actor/OnChildAttributeUpdate';
import {ObjectAttribute} from '../../../src/core/geometry/Attribute';
import {
	ActorConnectionPointType,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
} from '../../../src/engine/nodes/utils/io/connections/Actor';

const onChildAttributeUpdateActorNodePresetsCollectionFactory: PresetsCollectionFactory<
	OnChildAttributeUpdateActorNode
> = (node: OnChildAttributeUpdateActorNode) => {
	const collection = new NodePresetsCollection();

	const b = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.BOOLEAN);

	const hovered = new BasePreset().addEntry(node.p.attribName, ObjectAttribute.HOVERED).addEntry(node.p.type, b);

	collection.setPresets({
		hovered,
	});

	return collection;
};
export const onChildAttributeUpdateActorPresetRegister: PresetRegister<
	typeof OnChildAttributeUpdateActorNode,
	OnChildAttributeUpdateActorNode
> = {
	nodeClass: OnChildAttributeUpdateActorNode,
	setupFunc: onChildAttributeUpdateActorNodePresetsCollectionFactory,
};
