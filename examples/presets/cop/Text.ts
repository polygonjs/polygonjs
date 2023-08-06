import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {TextCopNode} from '../../../src/engine/nodes/cop/Text';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

interface PresetCreateData {
	preset: BasePreset;
	presetName: string;
}

const textCopNodeNodePresetsCollectionFactory: PresetsCollectionFactory<TextCopNode> = (node: TextCopNode) => {
	const collection = new NodePresetsCollection();

	function _preset(fontName: string, presetName: string) {
		const preset = new BasePreset().addEntry(node.p.font, `${DEMO_ASSETS_ROOT_URL}/fonts/${fontName}`);
		return {preset, presetName};
	}

	function _sourcecodepro(presetName: string) {
		return _preset(`SourceCodePro-${presetName}.ttf`, presetName);
	}

	const FONT_DICT: Record<string, PresetCreateData[]> = {
		SourceCodePro: [
			'BlackIt',
			'Black',
			'BoldIt',
			'Bold',
			'ExtraLightIt',
			'ExtraLight',
			'LightIt',
			'Light',
			'MediumIt',
			'Medium',
			'Regular',
			'SemiboldIt',
			'Semibold',
		].map(_sourcecodepro),
		Tastysushi: [_preset('Tastysushi.ttf', 'Regular'), _preset('TastysushiLine.ttf', 'Line')],
		misc: [
			_preset('kenpixel.ttf', 'Kenpixel'),
			_preset('Wintersoul.ttf', 'Wintersoul'),
			_preset('Absolute.ttf', 'Absolute'),
			_preset('SpecialValentine.ttf', 'SpecialValentine'),
			_preset('Waterlily_Script.ttf', 'Waterlily_Script'),
		],
	};

	const fontGroupNames: string[] = Object.keys(FONT_DICT);
	for (let fontGroupName of fontGroupNames) {
		const presetDatas = FONT_DICT[fontGroupName];
		if (presetDatas) {
			for (let presetData of presetDatas) {
				const fullName = `${fontGroupName}/${presetData.presetName}`;
				collection.addPreset(fullName, presetData.preset);
			}
			// const presetName = fontName.split('.')[0];
		}
	}

	return collection;
};
export const textCopPresetRegister: PresetRegister<typeof TextCopNode, TextCopNode> = {
	nodeClass: TextCopNode,
	setupFunc: textCopNodeNodePresetsCollectionFactory,
};
