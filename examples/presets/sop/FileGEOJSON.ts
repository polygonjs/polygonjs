import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {FileGEOJSONSopNode} from '../../../src/engine/nodes/sop/FileGEOJSON';

const fileGEOJSONSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileGEOJSONSopNode> = (
	node: FileGEOJSONSopNode
) => {
	const collection = new NodePresetsCollection();

	const wikipediaSample = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/geojson/wikipedia.geojson`
	);
	const brooklyn = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/geojson/ebrelsford/brooklyn.geojson`
	);
	const queens = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/geojson/ebrelsford/queens.geojson`
	);
	// const ibm_bounded = new BasePreset().addEntry<ParamType.STRING>(
	// 	node.p.url,
	// 	`${DEMO_ASSETS_ROOT_URL}/models/geojson/ibm.bounded.geojson`
	// );
	// const ibm_features = new BasePreset().addEntry<ParamType.STRING>(
	// 	node.p.url,
	// 	`${DEMO_ASSETS_ROOT_URL}/models/geojson/ibm.features.geojson`
	// );
	// const ibm_line = new BasePreset().addEntry<ParamType.STRING>(
	// 	node.p.url,
	// 	`${DEMO_ASSETS_ROOT_URL}/models/geojson/ibm.line.geojson`
	// );

	collection.setPresets({
		wikipediaSample,
		brooklyn,
		queens,
		// ibm_bounded,
		// ibm_features,
		// ibm_line,
	});

	return collection;
};

export const fileGEOJSONSopPresetRegister: PresetRegister<typeof FileGEOJSONSopNode, FileGEOJSONSopNode> = {
	nodeClass: FileGEOJSONSopNode,
	setupFunc: fileGEOJSONSopNodePresetsCollectionFactory,
};
