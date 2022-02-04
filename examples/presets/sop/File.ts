import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {FileSopNode} from '../../../src/engine/nodes/sop/File';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {PolyDictionary} from '../../../src/types/GlobalTypes';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const fileSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileSopNode> = (node: FileSopNode) => {
	const collection = new NodePresetsCollection();

	const bunny_drc = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/bunny.drc`
	);
	const bunny_fbx = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/fbx/stanford-bunny.fbx`
	);
	const car_glb = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/car.glb`);
	const deer_obj = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/deer.obj`);
	const flamingo_glb = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/flamingo.glb`
	);
	const parrot_glb = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/parrot.glb`
	);
	const soldier_glb = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/soldier.glb`
	);
	const wolf_obj = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/wolf.obj`);
	const dolphin_obj = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/dolphin.obj`
	);
	const sphere_with_texture = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/sphere_with_texture.glb`
	);

	function _3dscanstores() {
		function _3dscanstore(fileName: string) {
			return new BasePreset().addEntry<ParamType.STRING>(
				node.p.url,
				`${DEMO_ASSETS_ROOT_URL}/models/resources/3dscanstore.com/BaseMeshes/OBJ/${fileName}.obj`
			);
		}
		const fileNames = ['Female-Average-Head', 'Male-Average-Head', 'Super-Average-Head'];
		const dict: PolyDictionary<BasePreset> = {};
		for (let fileName of fileNames) {
			dict[`3dscanstore.com/${fileName}`] = _3dscanstore(fileName);
		}
		return dict;
	}
	function _renderPeoples() {
		function _renderPeople(fileName: string) {
			return new BasePreset().addEntry<ParamType.STRING>(
				node.p.url,
				`${DEMO_ASSETS_ROOT_URL}/models/resources/renderpeople.com/${fileName}.obj`
			);
		}
		const fileNameDatas = [
			{dennis: 'rp_dennis_posed_004_OBJ/rp_dennis_posed_004_30k'},
			{fabienne: 'rp_fabienne_percy_posed_001_OBJ/rp_fabienne_percy_posed_001_60k'},
			{mei: 'rp_mei_posed_001_OBJ/rp_mei_posed_001_30k'},
		];
		const dict: PolyDictionary<BasePreset> = {};
		for (let fileNameData of fileNameDatas) {
			const shortName = Object.keys(fileNameData)[0];
			const fileName = Object.values(fileNameData)[0];
			dict[`renderpeople.com/${shortName}`] = _renderPeople(fileName);
		}
		return dict;
	}

	collection.setPresets({
		bunny_drc,
		bunny_fbx,
		car_glb,
		deer_obj,
		flamingo_glb,
		parrot_glb,
		soldier_glb,
		wolf_obj,
		dolphin_obj,
		sphere_with_texture,
		..._3dscanstores(),
		..._renderPeoples(),
	});

	return collection;
};

export const fileSopPresetRegister: PresetRegister<typeof FileSopNode, FileSopNode> = {
	nodeClass: FileSopNode,
	setupFunc: fileSopNodePresetsCollectionFactory,
};
