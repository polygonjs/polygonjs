import {
	LinearEncoding,
	sRGBEncoding,
	GammaEncoding,
	RGBEEncoding,
	RGBM7Encoding,
	RGBM16Encoding,
	RGBDEncoding,
	BasicDepthPacking,
	RGBADepthPacking,
} from 'three/src/constants';
import {PolyDictionary} from '../../types/GlobalTypes';

export const ENCODINGS: Array<PolyDictionary<number>> = [
	{LinearEncoding},
	{sRGBEncoding},
	{GammaEncoding},
	{RGBEEncoding},
	{RGBM7Encoding},
	{RGBM16Encoding},
	{RGBDEncoding},
	{BasicDepthPacking},
	{RGBADepthPacking},
];
const ENCODING_NAME_BY_ENCODING: PolyDictionary<string> = {};
for (let encodingMap of ENCODINGS) {
	const encodingName = Object.keys(encodingMap)[0];
	const encodingValue = Object.values(encodingMap)[0];
	ENCODING_NAME_BY_ENCODING[`${encodingValue}`] = encodingName;
}
export {ENCODING_NAME_BY_ENCODING};
