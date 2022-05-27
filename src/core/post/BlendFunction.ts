import {BlendFunction} from 'postprocessing';
import {MenuNumericParamOptions} from '../../engine/params/utils/OptionsController';

export const BLEND_FUNCTIONS: BlendFunction[] = [
	BlendFunction.SKIP,
	BlendFunction.ADD,
	BlendFunction.ALPHA,
	BlendFunction.AVERAGE,
	BlendFunction.COLOR_BURN,
	BlendFunction.COLOR_DODGE,
	BlendFunction.DARKEN,
	BlendFunction.DIFFERENCE,
	BlendFunction.EXCLUSION,
	BlendFunction.LIGHTEN,
	BlendFunction.MULTIPLY,
	BlendFunction.DIVIDE,
	BlendFunction.NEGATION,
	BlendFunction.NORMAL,
	BlendFunction.OVERLAY,
	BlendFunction.REFLECT,
	BlendFunction.SCREEN,
	BlendFunction.SOFT_LIGHT,
	BlendFunction.SUBTRACT,
];

const BLEND_FUNCTION_NAME_BY_INDEX = [
	'SKIP',
	'ADD',
	'ALPHA',
	'AVERAGE',
	'COLOR_BURN',
	'COLOR_DODGE',
	'DARKEN',
	'DIFFERENCE',
	'EXCLUSION',
	'LIGHTEN',
	'MULTIPLY',
	'DIVIDE',
	'NEGATION',
	'NORMAL',
	'OVERLAY',
	'REFLECT',
	'SCREEN',
	'SOFT_LIGHT',
	'SUBTRACT',
];

export const BLEND_FUNCTION_MENU_OPTIONS: MenuNumericParamOptions = {
	menu: {
		entries: BLEND_FUNCTIONS.map((value) => {
			return {
				name: BLEND_FUNCTION_NAME_BY_INDEX[value],
				value,
			};
		}),
	},
};
