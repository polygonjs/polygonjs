import {
	ColorSpace,
	NoColorSpace,
	SRGBColorSpace,
	LinearSRGBColorSpace,
	DisplayP3ColorSpace,
	LinearDisplayP3ColorSpace,
} from 'three';
// import {PolyDictionary} from '../../types/GlobalTypes';

export const COLOR_SPACES: Array<ColorSpace> = [
	NoColorSpace,
	SRGBColorSpace,
	LinearSRGBColorSpace,
	DisplayP3ColorSpace,
	LinearDisplayP3ColorSpace,
];
export const COLOR_SPACES_BY_NAME: Array<Record<string, ColorSpace>> = [
	{Linear: NoColorSpace},
	{sRGB: SRGBColorSpace},
	{LinearSRGB: LinearSRGBColorSpace},
	{DisplayP3: DisplayP3ColorSpace},
	{LinearDisplayP3: LinearDisplayP3ColorSpace},
];
const COLOR_SPACE_NAME_BY_COLOR_SPACE: Record<ColorSpace, string> = {
	[NoColorSpace]: Object.keys(COLOR_SPACES_BY_NAME[0])[0],
	[SRGBColorSpace]: Object.keys(COLOR_SPACES_BY_NAME[1])[0],
	[LinearSRGBColorSpace]: Object.keys(COLOR_SPACES_BY_NAME[2])[0],
	[DisplayP3ColorSpace]: Object.keys(COLOR_SPACES_BY_NAME[3])[0],
	[LinearDisplayP3ColorSpace]: Object.keys(COLOR_SPACES_BY_NAME[4])[0],
};
// for (let colorSpaceMap of COLOR_SPACES_BY_NAME) {
// 	const colorSpaceName = Object.keys(colorSpaceMap)[0];
// 	const colorSpaceValue = Object.values(colorSpaceMap)[0];
// 	COLOR_SPACE_NAME_BY_COLOR_SPACE[colorSpaceValue] = colorSpaceName;
// }
export {COLOR_SPACE_NAME_BY_COLOR_SPACE};
