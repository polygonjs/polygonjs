import {BlendFunction} from 'postprocessing';
import {MenuNumericParamOptions} from '../../engine/params/utils/OptionsController';

const BLEND_FUNCTION_BY_NAME = [
	{SKIP: BlendFunction.SKIP},
	{SET: BlendFunction.SET},
	{ADD: BlendFunction.ADD},
	{ALPHA: BlendFunction.ALPHA},
	{AVERAGE: BlendFunction.AVERAGE},
	{COLOR: BlendFunction.COLOR},
	{COLOR_BURN: BlendFunction.COLOR_BURN},
	{COLOR_DODGE: BlendFunction.COLOR_DODGE},
	{DARKEN: BlendFunction.DARKEN},
	{DIFFERENCE: BlendFunction.DIFFERENCE},
	{DIVIDE: BlendFunction.DIVIDE},
	// {DST: BlendFunction.DST}, // DST and SKIP are the same
	{EXCLUSION: BlendFunction.EXCLUSION},
	{HARD_LIGHT: BlendFunction.HARD_LIGHT},
	{HARD_MIX: BlendFunction.HARD_MIX},
	{HUE: BlendFunction.HUE},
	{INVERT: BlendFunction.INVERT},
	{INVERT_RGB: BlendFunction.INVERT_RGB},
	{LIGHTEN: BlendFunction.LIGHTEN},
	{LINEAR_BURN: BlendFunction.LINEAR_BURN},
	{LINEAR_DODGE: BlendFunction.LINEAR_DODGE},
	{LINEAR_LIGHT: BlendFunction.LINEAR_LIGHT},
	{LUMINOSITY: BlendFunction.LUMINOSITY},
	{MULTIPLY: BlendFunction.MULTIPLY},
	{NEGATION: BlendFunction.NEGATION},
	{NORMAL: BlendFunction.NORMAL},
	{OVERLAY: BlendFunction.OVERLAY},
	{PIN_LIGHT: BlendFunction.PIN_LIGHT},
	{SATURATION: BlendFunction.SATURATION},
	{REFLECT: BlendFunction.REFLECT},
	{SCREEN: BlendFunction.SCREEN},
	{SOFT_LIGHT: BlendFunction.SOFT_LIGHT},
	// {SRC: BlendFunction.SRC}, SET and SRC are the same
	{SUBTRACT: BlendFunction.SUBTRACT},
	{VIVID_LIGHT: BlendFunction.VIVID_LIGHT},
];

export const BLEND_FUNCTION_MENU_OPTIONS: MenuNumericParamOptions = {
	menu: {
		entries: BLEND_FUNCTION_BY_NAME.map((o, i) => {
			return {
				name: Object.keys(o)[0],
				value: Object.values(o)[0],
			};
		}),
	},
};
// console.log(BLEND_FUNCTION_MENU_OPTIONS.menu?.entries);
