import {
	AlphaFormat,
	RedFormat,
	RedIntegerFormat,
	RGFormat,
	RGIntegerFormat,
	// RGBFormat,
	RGBIntegerFormat,
	RGBAFormat,
	RGBAIntegerFormat,
	LuminanceFormat,
	LuminanceAlphaFormat,
	// RGBEFormat, //  removing as it is set to same value as RGBAFormat, so can be confusing
	DepthFormat,
	DepthStencilFormat,
} from 'three/src/constants';

export const TEXTURE_FORMATS = [
	{AlphaFormat},
	{RedFormat},
	{RedIntegerFormat},
	{RGFormat},
	{RGIntegerFormat},
	// {RGBFormat},
	{RGBIntegerFormat},
	{RGBAFormat},
	{RGBAIntegerFormat},
	{LuminanceFormat},
	{LuminanceAlphaFormat},
	// {RGBEFormat},
	{DepthFormat},
	{DepthStencilFormat},
];
