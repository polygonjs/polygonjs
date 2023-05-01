import {Vector2Like} from './../../types/GlobalTypes';
export interface KeyframeData {
	pos: number;
	value: number;
	tan: Vector2Like;
}
export type ChannelData = KeyframeData[];
// export interface ChannelsData {
// 	[Key: string]: ChannelData;
// }
export type ChannelsData = Record<string, ChannelData>;
