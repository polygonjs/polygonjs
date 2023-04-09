import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {GetChildrenAttributesJsNode} from '../../../src/engine/nodes/js/GetChildrenAttributes';
import {ObjectAttribute} from '../../../src/core/geometry/Attribute';
import {
	JsConnectionPointType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../../../src/engine/nodes/utils/io/connections/Js';

const getChildrenAttributesJsNodePresetsCollectionFactory: PresetsCollectionFactory<GetChildrenAttributesJsNode> = (
	node: GetChildrenAttributesJsNode
) => {
	const collection = new NodePresetsCollection();

	const b = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.BOOLEAN);

	const hovered = new BasePreset().addEntry(node.p.attribName, ObjectAttribute.HOVERED).addEntry(node.p.type, b);

	collection.setPresets({
		hovered,
	});

	return collection;
};
export const getChildrenAttributesJsPresetRegister: PresetRegister<
	typeof GetChildrenAttributesJsNode,
	GetChildrenAttributesJsNode
> = {
	nodeClass: GetChildrenAttributesJsNode,
	setupFunc: getChildrenAttributesJsNodePresetsCollectionFactory,
};
