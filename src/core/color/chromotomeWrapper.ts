import {getAll} from 'chromotome';
export interface Palette {
	colors: string[];
	name: string;
}
import {VisibleIfParamOptions} from '../../engine/params/utils/OptionsController';

export const ALL_PALETTES: Palette[] = getAll();
export const PALETTES_BY_NAME: Map<string, Palette> = new Map();
const USED_PALETTES: Palette[] = [];
export let MAX_PALETTE_COLORS_COUNT: number = 0;
const minColorsAllowed = 3;
const maxColorsAllowed = 5;
// let paletteWithMaxColors: Palette | undefined = undefined;
for (let palette of ALL_PALETTES) {
	const colorsCount = palette.colors.length;
	if (colorsCount >= minColorsAllowed && colorsCount <= maxColorsAllowed) {
		PALETTES_BY_NAME.set(palette.name, palette);
		USED_PALETTES.push(palette);
		if (MAX_PALETTE_COLORS_COUNT < colorsCount) {
			MAX_PALETTE_COLORS_COUNT = colorsCount;
			// paletteWithMaxColors = palette;
		}
	}
}
// const sortedPalettes = USED_PALETTES.sort((a, b) => a.colors.length - b.colors.length);
export const SORTED_PALETTE_NAMES: string[] = USED_PALETTES.map((p) => p.name).sort();

export function visibleIfColorsCountAtLeast(minVal: number): VisibleIfParamOptions[] {
	const options: VisibleIfParamOptions[] = [];
	for (let i = minVal; i <= MAX_PALETTE_COLORS_COUNT; i++) {
		options.push({colorsCount: i});
	}
	return options;
}
