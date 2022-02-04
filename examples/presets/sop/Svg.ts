import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {ParamType} from '../../../src/engine/poly/ParamType';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';
import {SvgSopNode} from '../../../src/engine/nodes/sop/Svg';

const svgSopNodePresetsCollectionFactory: PresetsCollectionFactory<SvgSopNode> = (node: SvgSopNode) => {
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

export const svgSopPresetRegister: PresetRegister<typeof SvgSopNode, SvgSopNode> = {
	nodeClass: SvgSopNode,
	setupFunc: svgSopNodePresetsCollectionFactory,
};
