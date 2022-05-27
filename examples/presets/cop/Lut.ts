import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {LutCopNode} from '../../../src/engine/nodes/cop/Lut';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const lutCopNodePresetsCollectionFactory: PresetsCollectionFactory<LutCopNode> = (node: LutCopNode) => {
	const collection = new NodePresetsCollection();

	function png(fileName: string) {
		return new BasePreset().addEntry(node.p.url, `${DEMO_ASSETS_ROOT_URL}/textures/lut/png/${fileName}.png`);
	}

	const bleachBypass = png(`bleach-bypass`);
	const candleLight = png(`candle-light`);
	const coolContrast = png(`cool-contrast`);
	const desaturatedFog = png(`desaturated-fog`);
	const evening = png(`evening`);
	const fall = png(`fall`);
	const filmic1 = png(`filmic1`);
	const filmic2 = png(`filmic2`);
	const matrixGreen = png(`matrix-green`);
	const strongAmber = png(`strong-amber`);
	const warmContrast = png(`warm-contrast`);

	collection.setPresets({
		bleachBypass,
		candleLight,
		coolContrast,
		desaturatedFog,
		evening,
		fall,
		filmic1,
		filmic2,
		matrixGreen,
		strongAmber,
		warmContrast,
	});

	return collection;
};
export const lutCopPresetRegister: PresetRegister<typeof LutCopNode, LutCopNode> = {
	nodeClass: LutCopNode,
	setupFunc: lutCopNodePresetsCollectionFactory,
};
