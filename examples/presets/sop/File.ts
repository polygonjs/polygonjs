import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {FileDRCSopNode} from '../../../src/engine/nodes/sop/FileDRC';
import {FileFBXSopNode} from '../../../src/engine/nodes/sop/FileFBX';
import {FileGLTFSopNode} from '../../../src/engine/nodes/sop/FileGLTF';
import {FileJSONSopNode} from '../../../src/engine/nodes/sop/FileJSON';
import {FileMPDSopNode} from '../../../src/engine/nodes/sop/FileMPD';
import {FileOBJSopNode} from '../../../src/engine/nodes/sop/FileOBJ';
import {FilePDBSopNode} from '../../../src/engine/nodes/sop/FilePDB';
import {FilePLYSopNode} from '../../../src/engine/nodes/sop/FilePLY';
import {FileSTLSopNode} from '../../../src/engine/nodes/sop/FileSTL';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {PolyDictionary} from '../../../src/types/GlobalTypes';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

function generateThreedScans(node: FileGLTFSopNode) {
	return function _threedscans() {
		function _threedscan(fileName: string) {
			return new BasePreset().addEntry<ParamType.STRING>(
				node.p.url,
				`${DEMO_ASSETS_ROOT_URL}/models/resources/threedscans.com/${fileName}.glb`
			);
		}
		const fileNames = [
			'beethoven',
			'eagle',
			'einstein',
			'horse_head',
			'jenner',
			'pan',
			'rhino',
			'theodoric_the_great',
			'zenobia_in_chains',
		];
		const dict: PolyDictionary<BasePreset> = {};
		for (let fileName of fileNames) {
			dict[`threedscans.com/${fileName}`] = _threedscan(fileName);
		}
		return dict;
	};
}
function _quaternius(node: FileGLTFSopNode) {
	function _quaterniusAnimal(animal: string) {
		return new BasePreset().addEntry<ParamType.STRING>(
			node.p.url,
			`${DEMO_ASSETS_ROOT_URL}/models/resources/quaternius/animals/${animal}.gltf`
		);
	}

	const animals: string[] = [
		'Alpaca',
		'Bull',
		'Cow',
		'Deer',
		'Donkey',
		'Fox',
		'Horse',
		'Horse_White',
		'Husky',
		'ShibaInu',
		'Stag',
		'Wolf',
	];
	const dict: PolyDictionary<BasePreset> = {};
	for (let animal of animals) {
		dict[`quaternius/${animal}`] = _quaterniusAnimal(animal);
	}
	return dict;
}

const drc = (node: FileDRCSopNode) => {
	return {
		bunny_drc: new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/bunny.drc`),
	};
};

const fbx = (node: FileFBXSopNode) => {
	return {
		bunny_fbx: new BasePreset().addEntry<ParamType.STRING>(
			node.p.url,
			`${DEMO_ASSETS_ROOT_URL}/models/fbx/stanford-bunny.fbx`
		),
	};
};
const mpd = (node: FileMPDSopNode) => {
	const list = [
		`10174-1-ImperialAT-ST-UCS.mpd_Packed`,
		`1621-1-LunarMPVVehicle.mpd_Packed`,
		`30023-1-Lighthouse.ldr_Packed`,
		`30051-1-X-wingFighter-Mini.mpd_Packed`,
		`30054-1-AT-ST-Mini.mpd_Packed`,
		`4489-1-AT-AT-Mini.mpd_Packed`,
		`4494-1-Imperial Shuttle-Mini.mpd_Packed`,
		`4838-1-MiniVehicles.mpd_Packed`,
		`4915-1-MiniConstruction.mpd_Packed`,
		`4918-1-MiniFlyers.mpd_Packed`,
		`5935-1-IslandHopper.mpd_Packed`,
		`6965-1-TIEIntercep_4h4MXk5.mpd_Packed`,
		`6966-1-JediStarfighter-Mini.mpd_Packed`,
		`7140-1-X-wingFighter.mpd_Packed`,
		`889-1-RadarTruck.mpd_Packed`,
		`car.ldr_Packed`,
	];

	const data: PolyDictionary<BasePreset> = {};
	for (let elem of list) {
		data[elem] = new BasePreset().addEntry<ParamType.STRING>(
			node.p.url,
			`${DEMO_ASSETS_ROOT_URL}/models/ldraw/officialLibrary/models/${elem}.mpd`
		);
	}

	return data;
};

const pdb = (node: FileMPDSopNode) => {
	return {
		ethanol: new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/ethanol.pdb`),
	};
};
const ply = (node: FileMPDSopNode) => {
	return {
		dolphine: new BasePreset().addEntry<ParamType.STRING>(
			node.p.url,
			`${DEMO_ASSETS_ROOT_URL}/models/dolphins_be.ply`
		),
	};
};
const gltf = (node: FileGLTFSopNode) => {
	const car = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/car.glb`);
	const flamingo = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/flamingo.glb`
	);
	const parrot = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/parrot.glb`);
	const soldier = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/soldier.glb`
	);
	const sphere_with_texture = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/sphere_with_texture.glb`
	);
	function _photogrammetry() {
		function _photogrammetryModel(fileName: string) {
			return new BasePreset().addEntry<ParamType.STRING>(
				node.p.url,
				`${DEMO_ASSETS_ROOT_URL}/models/photogrammetry/${fileName}.glb`
			);
		}
		const fileNames = [
			'gui_fradin_head_only_hi_res',
			'gui_fradin_head_only_lo_res',
			'gui_fradin_hi_res',
			'gui_fradin_lo_res',
			'gui_fradin_textured',
			'gui_fradin_textured_head_only',
		];
		const dict: PolyDictionary<BasePreset> = {};
		for (let fileName of fileNames) {
			dict[`photogrammetry/${fileName}`] = _photogrammetryModel(fileName);
		}
		return dict;
	}
	return {
		car,
		flamingo,
		parrot,
		soldier,
		sphere_with_texture,
		..._photogrammetry(),
	};
};
const obj = (node: FileOBJSopNode) => {
	const deer = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/deer.obj`);
	const wolf = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/wolf.obj`);
	const dolphin = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/dolphin.obj`
	);
	function _3dscanstores() {
		function _3dscanstore(fileName: string) {
			return new BasePreset().addEntry<ParamType.STRING>(
				node.p.url,
				`${DEMO_ASSETS_ROOT_URL}/models/resources/3dscanstore.com/BaseMeshes/OBJ/${fileName}.obj`
			);
		}
		const fileNames = [
			'Female-Average-Head',
			'Female-Average-Head.capped',
			'Male-Average-Head',
			'Male-Average-Head.capped',
			'Super-Average-Head',
		];
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
			{dennis_30k: 'rp_dennis_posed_004_OBJ/rp_dennis_posed_004_30k'},
			{dennis_2k: 'rp_dennis_posed_004_OBJ/rp_dennis_posed_004_2k'},
			{fabienne: 'rp_fabienne_percy_posed_001_OBJ/rp_fabienne_percy_posed_001_60k'},
			{mei_30k: 'rp_mei_posed_001_OBJ/rp_mei_posed_001_30k'},
			{mei_2k: 'rp_mei_posed_001_OBJ/rp_mei_posed_001_2k'},
		];
		const dict: PolyDictionary<BasePreset> = {};
		for (let fileNameData of fileNameDatas) {
			const shortName = Object.keys(fileNameData)[0];
			const fileName = Object.values(fileNameData)[0];
			dict[`renderpeople.com/${shortName}`] = _renderPeople(fileName);
		}
		return dict;
	}
	return {
		deer,
		wolf,
		dolphin,
		..._3dscanstores(),
		..._renderPeoples(),
	};
};
const threejsJSON = (node: FileJSONSopNode) => {
	return {
		scatteredBoxes: new BasePreset().addEntry<ParamType.STRING>(
			node.p.url,
			`${DEMO_ASSETS_ROOT_URL}/models/threejs/scatteredBoxes.json`
		),
	};
};
const stl = (node: FileSTLSopNode) => {
	return {
		warrior: new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/warrior.stl`),
	};
};

const fileDRCSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileDRCSopNode> = (node: FileDRCSopNode) => {
	const collection = new NodePresetsCollection();
	collection.setPresets({
		...drc(node),
	});

	return collection;
};
const fileFBXSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileFBXSopNode> = (node: FileFBXSopNode) => {
	const collection = new NodePresetsCollection();
	collection.setPresets({
		...fbx(node),
	});

	return collection;
};
const fileGLTFSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileGLTFSopNode> = (node: FileGLTFSopNode) => {
	const collection = new NodePresetsCollection();
	collection.setPresets({
		...gltf(node),
		...generateThreedScans(node)(),
		..._quaternius(node),
	});

	return collection;
};

const fileJSONSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileJSONSopNode> = (node: FileJSONSopNode) => {
	const collection = new NodePresetsCollection();
	collection.setPresets({
		...threejsJSON(node),
	});

	return collection;
};
const fileMPDSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileMPDSopNode> = (node: FileMPDSopNode) => {
	const collection = new NodePresetsCollection();
	collection.setPresets({
		...mpd(node),
	});

	return collection;
};
const fileOBJSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileOBJSopNode> = (node: FileOBJSopNode) => {
	const collection = new NodePresetsCollection();
	collection.setPresets({
		...obj(node),
	});

	return collection;
};
const filePDBSopNodePresetsCollectionFactory: PresetsCollectionFactory<FilePDBSopNode> = (node: FilePDBSopNode) => {
	const collection = new NodePresetsCollection();
	collection.setPresets({
		...pdb(node),
	});

	return collection;
};
const filePLYSopNodePresetsCollectionFactory: PresetsCollectionFactory<FilePDBSopNode> = (node: FilePLYSopNode) => {
	const collection = new NodePresetsCollection();
	collection.setPresets({
		...ply(node),
	});

	return collection;
};
const fileSTLSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileSTLSopNode> = (node: FileSTLSopNode) => {
	const collection = new NodePresetsCollection();
	collection.setPresets({
		...stl(node),
	});

	return collection;
};
export const fileDRCSopPresetRegister: PresetRegister<typeof FileDRCSopNode, FileDRCSopNode> = {
	nodeClass: FileDRCSopNode,
	setupFunc: fileDRCSopNodePresetsCollectionFactory,
};
export const fileFBXSopPresetRegister: PresetRegister<typeof FileFBXSopNode, FileFBXSopNode> = {
	nodeClass: FileFBXSopNode,
	setupFunc: fileFBXSopNodePresetsCollectionFactory,
};
export const fileGLTFSopPresetRegister: PresetRegister<typeof FileGLTFSopNode, FileGLTFSopNode> = {
	nodeClass: FileGLTFSopNode,
	setupFunc: fileGLTFSopNodePresetsCollectionFactory,
};
export const fileJSONSopPresetRegister: PresetRegister<typeof FileJSONSopNode, FileJSONSopNode> = {
	nodeClass: FileJSONSopNode,
	setupFunc: fileJSONSopNodePresetsCollectionFactory,
};
export const fileMPDSopPresetRegister: PresetRegister<typeof FileMPDSopNode, FileMPDSopNode> = {
	nodeClass: FileMPDSopNode,
	setupFunc: fileMPDSopNodePresetsCollectionFactory,
};
export const fileOBJSopPresetRegister: PresetRegister<typeof FileOBJSopNode, FileOBJSopNode> = {
	nodeClass: FileOBJSopNode,
	setupFunc: fileOBJSopNodePresetsCollectionFactory,
};
export const filePDBSopPresetRegister: PresetRegister<typeof FilePDBSopNode, FilePDBSopNode> = {
	nodeClass: FilePDBSopNode,
	setupFunc: filePDBSopNodePresetsCollectionFactory,
};
export const filePLYSopPresetRegister: PresetRegister<typeof FilePLYSopNode, FilePLYSopNode> = {
	nodeClass: FilePLYSopNode,
	setupFunc: filePLYSopNodePresetsCollectionFactory,
};
export const fileSTLSopPresetRegister: PresetRegister<typeof FileSTLSopNode, FileSTLSopNode> = {
	nodeClass: FileSTLSopNode,
	setupFunc: fileSTLSopNodePresetsCollectionFactory,
};
