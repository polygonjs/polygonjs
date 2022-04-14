import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {OnObjectAttributeUpdateActorNode} from '../../../src/engine/nodes/actor/OnObjectAttributeUpdate';
import {ObjectAttribute} from '../../../src/core/geometry/Attribute';
import {
	ActorConnectionPointType,
	PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES,
} from '../../../src/engine/nodes/utils/io/connections/Actor';

const onObjectAttributeUpdateActorNodePresetsCollectionFactory: PresetsCollectionFactory<
	OnObjectAttributeUpdateActorNode
> = (node: OnObjectAttributeUpdateActorNode) => {
	const collection = new NodePresetsCollection();

	const b = PARAM_CONVERTIBLE_ACTOR_CONNECTION_POINT_TYPES.indexOf(ActorConnectionPointType.BOOLEAN);

	const hovered = new BasePreset().addEntry(node.p.attribName, ObjectAttribute.HOVERED).addEntry(node.p.type, b);

	collection.setPresets({
		hovered,
	});

	return collection;
};
export const onObjectAttributeUpdateActorPresetRegister: PresetRegister<
	typeof OnObjectAttributeUpdateActorNode,
	OnObjectAttributeUpdateActorNode
> = {
	nodeClass: OnObjectAttributeUpdateActorNode,
	setupFunc: onObjectAttributeUpdateActorNodePresetsCollectionFactory,
};
