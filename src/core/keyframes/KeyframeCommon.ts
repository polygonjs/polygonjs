import {Vector2Like} from './../../types/GlobalTypes';

export interface SearchRange {
	min: number;
	max: number;
}
interface KeyframeDataPosVal {
	pos: number;
	value: number;
}
interface KeyframeTangentDataBasic {
	inOut: Vector2Like;
}
interface KeyframeTangentDataSplit {
	in: Vector2Like;
	out: Vector2Like;
}
export interface KeyframeDataBasic extends KeyframeDataPosVal, KeyframeTangentDataBasic {}
export interface KeyframeDataSplit extends KeyframeDataPosVal, KeyframeTangentDataSplit {}

export type KeyframeData = KeyframeDataBasic | KeyframeDataSplit;

export enum ChannelInterpolation {
	LINEAR = 'linear',
	CUBIC = 'cubic',
}

export type ChannelData = {
	keyframes: KeyframeData[];
	interpolation: ChannelInterpolation;
};
export type ChannelsData = Record<string, ChannelData>;

export function getTangent(keyframe: KeyframeData, isInTangent: boolean): Vector2Like {
	if ((keyframe as KeyframeDataBasic).inOut) {
		return (keyframe as KeyframeDataBasic).inOut;
	} else {
		return isInTangent ? (keyframe as KeyframeDataSplit).in : (keyframe as KeyframeDataSplit).out;
	}
}
