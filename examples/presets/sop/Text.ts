import {DEMO_ASSETS_ROOT_URL} from '../../../src/core/Assets';
import {TextSopNode} from '../../../src/engine/nodes/sop/Text';
import {BasePreset, NodePresetsCollection, PresetRegister, PresetsCollectionFactory} from '../BasePreset';

const FONT_NAMES: string[] = [
	'Absolute.ttf',
	'ColorTime-TTF.ttf',
	'DancingintheRainbow.ttf',
	'droid_sans_bold.typeface.json',
	'droid_sans_mono_regular.typeface.json',
	'droid_sans_regular.typeface.json',
	'droid_serif_bold.typeface.json',
	'droid_serif_regular.typeface.json',
	'fabfeltscript-bold.ttf',
	'gentilis_bold.typeface.json',
	'gentilis_regular.typeface.json',
	'helvetiker_bold.typeface.json',
	'helvetiker_regular.typeface.json',
	'kenpixel.ttf',
	'Libertinage.ttf',
	'montserrat-600.woff',
	'montserrat-600.woff2',
	'Multistrokes.ttf',
	'NERVOUSM_BOLD_ITALIC.ttf',
	'NERVOUSM_BOLD.ttf',
	'NERVOUSM_ITALIC.ttf',
	'NERVOUSM.ttf',
	'Nickainley-Normal.ttf',
	'optimer_bold.typeface.json',
	'optimer_regular.typeface.json',
	'ProximaNova-Light-webfont.woff',
	'ProximaNova-Light-webfont.woff2',
	'ProximaNova-Reg-webfont.woff',
	'ProximaNova-Reg-webfont.woff2',
	'ProximaNova-Sbold-webfont.woff',
	'ProximaNova-Sbold-webfont.woff2',
	'roboto-mono-regular.woff',
	'roboto-mono-regular.woff2',
	'SaturdaybelikeMadness.ttf',
	'SleepinginCastleland.ttf',
	'SourceCodePro-BlackIt.ttf',
	'SourceCodePro-Black.ttf',
	'SourceCodePro-BoldIt.ttf',
	'SourceCodePro-Bold.ttf',
	'SourceCodePro-ExtraLightIt.ttf',
	'SourceCodePro-ExtraLight.ttf',
	'SourceCodePro-It.ttf',
	'SourceCodePro-LightIt.ttf',
	'SourceCodePro-Light.ttf',
	'SourceCodePro-MediumIt.ttf',
	'SourceCodePro-Medium.ttf',
	'SourceCodePro-Regular.ttf',
	'SourceCodePro-SemiboldIt.ttf',
	'SourceCodePro-Semibold.ttf',
	'SpecialValentine.ttf',
	'TastysushiLine.ttf',
	'Tastysushi.ttf',
	'Waterlily_Script.ttf',
	'Wintersoul.ttf',
];

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

const textSopNodeNodePresetsCollectionFactory: PresetsCollectionFactory<TextSopNode> = (node: TextSopNode) => {
	const collection = new NodePresetsCollection();

	for (let fontName of FONT_NAMES) {
		const preset = new BasePreset().addEntry(node.p.font, `${DEMO_ASSETS_ROOT_URL}/fonts/${fontName}`);
		const presetName = fontName.split('.')[0];
		collection.addPreset(presetName, preset);
	}

	return collection;
};
export const textSopPresetRegister: PresetRegister<typeof TextSopNode, TextSopNode> = {
	nodeClass: TextSopNode,
	setupFunc: textSopNodeNodePresetsCollectionFactory,
};
