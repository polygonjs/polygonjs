import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {GetObjectUserDataJsNode} from '../../../src/engine/nodes/js/GetObjectUserData';
import {JsConnectionPointType, JS_CONNECTION_POINT_TYPES} from '../../../src/engine/nodes/utils/io/connections/Js';
import {ObjectUserData} from '../../../src/core/UserData';

const getObjectUserDataJsNodePresetsCollectionFactory: PresetsCollectionFactory<GetObjectUserDataJsNode> = (
	node: GetObjectUserDataJsNode
) => {
	const collection = new NodePresetsCollection();

	const TYPES = {
		catmulRomCurve3: JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.CATMULL_ROM_CURVE3),
		Object3D: JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.OBJECT_3D),
	};
	const _withName = (userDataName: string) => {
		return new BasePreset().addEntry(node.p.name, userDataName);
	};
	const _catmulRomCurve3 = (userDataName: string) => {
		return _withName(userDataName).addEntry(node.p.type, TYPES.catmulRomCurve3);
	};
	const _object3D = (userDataName: string) => {
		return _withName(userDataName).addEntry(node.p.type, TYPES.Object3D);
	};

	const path = _catmulRomCurve3(ObjectUserData.PATH);
	const lowResSoftBodyMesh = _object3D(ObjectUserData.LOW_RES_SOFT_BODY_MESH);

	collection.setPresets({
		path,
		lowResSoftBodyMesh,
	});

	return collection;
};
export const getObjectUserDataJsPresetRegister: PresetRegister<
	typeof GetObjectUserDataJsNode,
	GetObjectUserDataJsNode
> = {
	nodeClass: GetObjectUserDataJsNode,
	setupFunc: getObjectUserDataJsNodePresetsCollectionFactory,
};
