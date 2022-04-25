import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {FileSVGSopNode} from '../../../src/engine/nodes/sop/FileSVG';

const fileSVGSopNodePresetsCollectionFactory: PresetsCollectionFactory<FileSVGSopNode> = (node: FileSVGSopNode) => {
	const collection = new NodePresetsCollection();

	const tiger = new BasePreset().addEntry<ParamType.STRING>(
		node.p.url,
		`${DEMO_ASSETS_ROOT_URL}/models/svg/tiger.svg`
	);
	const wolf = new BasePreset().addEntry<ParamType.STRING>(node.p.url, `${DEMO_ASSETS_ROOT_URL}/models/svg/wolf.svg`);

	collection.setPresets({
		tiger,
		wolf,
	});

	return collection;
};

export const fileSVGSopPresetRegister: PresetRegister<typeof FileSVGSopNode, FileSVGSopNode> = {
	nodeClass: FileSVGSopNode,
	setupFunc: fileSVGSopNodePresetsCollectionFactory,
};
