import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {OnObjectAttributeUpdateJsNode} from '../../../src/engine/nodes/js/OnObjectAttributeUpdate';
import {ObjectAttribute} from '../../../src/core/geometry/Attribute';
import {
	JsConnectionPointType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../../../src/engine/nodes/utils/io/connections/Js';
import {StringParam} from '../../../src/engine/params/String';

const onObjectAttributeUpdateJsNodePresetsCollectionFactory: PresetsCollectionFactory<OnObjectAttributeUpdateJsNode> = (
	node: OnObjectAttributeUpdateJsNode
) => {
	const collection = new NodePresetsCollection();

	const b = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.BOOLEAN);

	const hovered = new BasePreset()
		.addEntry(node.params.get('attribName') as StringParam, ObjectAttribute.HOVERED)
		.addEntry(node.p.type, b);

	collection.setPresets({
		hovered,
	});

	return collection;
};
export const onObjectAttributeUpdateJsPresetRegister: PresetRegister<
	typeof OnObjectAttributeUpdateJsNode,
	OnObjectAttributeUpdateJsNode
> = {
	nodeClass: OnObjectAttributeUpdateJsNode,
	setupFunc: onObjectAttributeUpdateJsNodePresetsCollectionFactory,
};
