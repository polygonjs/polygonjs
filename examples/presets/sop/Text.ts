import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {TextSopNode} from '../../../src/engine/nodes/sop/Text';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

// const FONT_NAMES: Record<string,string> = {
// 	'Absolute':'Absolute.ttf',
// 	'ColorTime':'ColorTime-TTF.ttf',
// }
// 	'Absolute.ttf',
// 	'ColorTime-TTF.ttf',
// 	'DancingintheRainbow.ttf',
// 	'droid_sans_bold.typeface.json',
// 	'droid_sans_mono_regular.typeface.json',
// 	'droid_sans_regular.typeface.json',
// 	'droid_serif_bold.typeface.json',
// 	'droid_serif_regular.typeface.json',
// 	'fabfeltscript-bold.ttf',
// 	'gentilis_bold.typeface.json',
// 	'gentilis_regular.typeface.json',
// 	'helvetiker_bold.typeface.json',
// 	'helvetiker_regular.typeface.json',
// 	'kenpixel.ttf',
// 	'Libertinage.ttf',
// 	'montserrat-600.woff',
// 	// 'montserrat-600.woff2',
// 	'Multistrokes.ttf',
// 	'NERVOUSM_BOLD_ITALIC.ttf',
// 	'NERVOUSM_BOLD.ttf',
// 	'NERVOUSM_ITALIC.ttf',
// 	'NERVOUSM.ttf',
// 	'Nickainley-Normal.ttf',
// 	'optimer_bold.typeface.json',
// 	'optimer_regular.typeface.json',
// 	'ProximaNova-Light-webfont.woff',
// 	// 'ProximaNova-Light-webfont.woff2',
// 	'ProximaNova-Reg-webfont.woff',
// 	// 'ProximaNova-Reg-webfont.woff2',
// 	'ProximaNova-Sbold-webfont.woff',
// 	// 'ProximaNova-Sbold-webfont.woff2',
// 	'roboto-mono-regular.woff',
// 	// 'roboto-mono-regular.woff2',
// 	'SaturdaybelikeMadness.ttf',
// 	'SleepinginCastleland.ttf',
// 	'SourceCodePro-BlackIt.ttf',
// 	'SourceCodePro-Black.ttf',
// 	'SourceCodePro-BoldIt.ttf',
// 	'SourceCodePro-Bold.ttf',
// 	'SourceCodePro-ExtraLightIt.ttf',
// 	'SourceCodePro-ExtraLight.ttf',
// 	'SourceCodePro-It.ttf',
// 	'SourceCodePro-LightIt.ttf',
// 	'SourceCodePro-Light.ttf',
// 	'SourceCodePro-MediumIt.ttf',
// 	'SourceCodePro-Medium.ttf',
// 	'SourceCodePro-Regular.ttf',
// 	'SourceCodePro-SemiboldIt.ttf',
// 	'SourceCodePro-Semibold.ttf',
// 	'SpecialValentine.ttf',
// 	'TastysushiLine.ttf',
// 	'Tastysushi.ttf',
// 	'Waterlily_Script.ttf',
// 	'Wintersoul.ttf',
// ];

// type TextSopNodePresetFunction = (node: TextSopNode) => void;
// export function TextSopNodePresets() {
// 	const data: PolyDictionary<TextSopNodePresetFunction> = {};
// 	for (let fontName of FONT_NAMES) {
// 		const presetName = fontName.split('.')[0];
// 		data[presetName] = function (node: TextSopNode) {
// 			node.p.font.set(`${DEMO_ASSETS_ROOT_URL}/fonts/${fontName}`);
// 		};
// 	}
// 	return data;
// }
interface PresetCreateData {
	preset: BasePreset;
	presetName: string;
}
interface PresetOptions {
	segments?: number;
}

const textSopNodeNodePresetsCollectionFactory: PresetsCollectionFactory<TextSopNode> = (node: TextSopNode) => {
	const collection = new NodePresetsCollection();

	const optimerOptions: PresetOptions = {
		segments: 4,
	};
	const helvetikerOptions: PresetOptions = {
		segments: 4,
	};
	const droidOptions: PresetOptions = {
		segments: 4,
	};
	const sourcecodeproOptions: PresetOptions = {
		segments: 2,
	};

	function _preset(fontName: string, presetName: string, options: PresetOptions = {}) {
		options['segments'] = options['segments'] || 1;
		const preset = new BasePreset()
			.addEntry(node.p.font, `${DEMO_ASSETS_ROOT_URL}/fonts/${fontName}`)
			.addEntry(node.p.segments, options['segments']);
		return {preset, presetName};
	}
	function _droid(fontName: string, presetName: string) {
		return _preset(fontName, presetName, droidOptions);
	}
	function _helvetiker(fontName: string, presetName: string) {
		return _preset(fontName, presetName, helvetikerOptions);
	}
	function _optimer(fontName: string, presetName: string) {
		return _preset(fontName, presetName, optimerOptions);
	}
	function _sourcecodepro(presetName: string) {
		return _preset(`SourceCodePro-${presetName}.ttf`, presetName, sourcecodeproOptions);
	}

	const FONT_DICT: Record<string, PresetCreateData[]> = {
		// 'Absolute':'Absolute.ttf',
		// 'ColorTime':'ColorTime-TTF.ttf',
		// Proxima: [
		// 	_preset('ProximaNova-Light-webfont.woff', 'Light'),
		// 	// 'ProximaNova-Light-webfont.woff2',
		// 	_preset('ProximaNova-Reg-webfont.woff', 'Reg'),
		// 	// 'ProximaNova-Reg-webfont.woff2',
		// 	_preset('ProximaNova-Sbold-webfont.woff', 'Sbold'),
		// ],
		Droid: [
			_droid('droid_sans_bold.typeface.json', 'Sans Bold'),
			_droid('droid_sans_mono_regular.typeface.json', 'Sans Mono'),
			_droid('droid_sans_regular.typeface.json', 'Sans Regular'),
			_droid('droid_serif_bold.typeface.json', 'Serif Bold'),
			_droid('droid_serif_regular.typeface.json', 'Serif Regular'),
		],
		Gentillis: [
			_preset('gentilis_bold.typeface.json', 'Bold'),
			_preset('gentilis_regular.typeface.json', 'Regular'),
		],
		Helvetiker: [
			_helvetiker('helvetiker_bold.typeface.json', 'Bold'),
			_helvetiker('helvetiker_regular.typeface.json', 'Regular'),
		],
		// NervousM: [
		// 	_preset('NERVOUSM_BOLD_ITALIC.ttf', 'Italic'),
		// 	_preset('NERVOUSM_BOLD.ttf', 'Bold'),
		// 	_preset('NERVOUSM_ITALIC.ttf', 'Italic'),
		// 	_preset('NERVOUSM.ttf', 'Regular'),
		// ],
		Optimer: [_optimer('optimer_bold.typeface.json', 'Bold'), _optimer('optimer_regular.typeface.json', 'Regular')],
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
			// const preset = _preset(fontName)
			// const presetName = fontName.split('.')[0];
		}
	}

	return collection;
};
export const textSopPresetRegister: PresetRegister<typeof TextSopNode, TextSopNode> = {
	nodeClass: TextSopNode,
	setupFunc: textSopNodeNodePresetsCollectionFactory,
};
