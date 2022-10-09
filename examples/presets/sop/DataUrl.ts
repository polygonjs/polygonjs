import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {DataType, DataUrlSopNode, DATA_TYPES} from '../../../src/engine/nodes/sop/DataUrl';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const dataUrlSopNodePresetsCollectionFactory: PresetsCollectionFactory<DataUrlSopNode> = (node: DataUrlSopNode) => {
	const collection = new NodePresetsCollection();

	function cleanPreset() {
		const preset = new BasePreset();
		preset.addEntry(node.p.jsonDataKeysPrefix, '');
		preset.addEntry(node.p.readAttribNamesFromFile, false);
		return preset;
	}

	function jsonPreset() {
		const preset = cleanPreset();
		preset.addEntry(node.p.dataType, DATA_TYPES.indexOf(DataType.JSON));
		return preset;
	}
	function csvPreset() {
		const preset = cleanPreset();
		preset.addEntry(node.p.dataType, DATA_TYPES.indexOf(DataType.CSV));
		return preset;
	}
	function withUrl(preset: BasePreset, fileName: string) {
		preset.addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/nodes/sop/DataUrl/${fileName}`);
		return preset;
	}

	const basic = withUrl(jsonPreset(), 'basic.json');
	const basicWithPosition = withUrl(jsonPreset(), 'basicWithPosition.json');
	const basicWithPrefix = withUrl(jsonPreset(), 'basicWithPrefix.json').addEntry(node.p.jsonDataKeysPrefix, 'myData');
	const defaultPreset = withUrl(jsonPreset(), 'default.json');
	const csvWithAttribNames = withUrl(csvPreset(), 'with_attrib_names.csv').addEntry(
		node.p.readAttribNamesFromFile,
		true
	);
	const csvWithoutAttribNames = withUrl(csvPreset(), 'without_attrib_names.csv')
		.addEntry(node.p.readAttribNamesFromFile, false)
		.addEntry(node.p.attribNames, 'id height scale strength');
	collection.setPresets({
		basic,
		basicWithPosition,
		basicWithPrefix,
		default: defaultPreset,
		csvWithAttribNames,
		csvWithoutAttribNames,
	});

	return collection;
};
export const dataUrlSopPresetRegister: PresetRegister<typeof DataUrlSopNode, DataUrlSopNode> = {
	nodeClass: DataUrlSopNode,
	setupFunc: dataUrlSopNodePresetsCollectionFactory,
};
