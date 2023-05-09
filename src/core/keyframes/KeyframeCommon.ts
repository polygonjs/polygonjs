import {CubicBezierCurve, LineCurve} from 'three';
export interface KeyframeTangent {
	slope: number;
	accel: number;
}

export interface SearchRange {
	min: number;
	max: number;
}

export interface KeyframeData {
	pos: number;
	value: number;
	in: KeyframeTangent;
	out?: KeyframeTangent;
}

export enum ChannelInterpolation {
	LINEAR = 'linear',
	CUBIC = 'cubic',
}

export type ChannelData = {
	keyframes: KeyframeData[];
	interpolation: ChannelInterpolation;
};
export type ChannelDataByName = Record<string, ChannelData>;

export type InterpolationCurve = CubicBezierCurve | LineCurve;
export type SetCurveCallback = (keyframeStart: KeyframeData, keyframeEnd: KeyframeData) => void;
export type GetValueCallback = (pos: number) => number;
