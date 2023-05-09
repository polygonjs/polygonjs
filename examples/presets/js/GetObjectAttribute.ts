import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {GetObjectAttributeJsNode} from '../../../src/engine/nodes/js/GetObjectAttribute';
import {ObjectAttribute} from '../../../src/core/geometry/Attribute';
import {
	JsConnectionPointType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
} from '../../../src/engine/nodes/utils/io/connections/Js';
import {StringParam} from '../../../src/engine/params/String';

const getObjectAttributeJsNodePresetsCollectionFactory: PresetsCollectionFactory<GetObjectAttributeJsNode> = (
	node: GetObjectAttributeJsNode
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
export const getObjectAttributeJsPresetRegister: PresetRegister<
	typeof GetObjectAttributeJsNode,
	GetObjectAttributeJsNode
> = {
	nodeClass: GetObjectAttributeJsNode,
	setupFunc: getObjectAttributeJsNodePresetsCollectionFactory,
};
