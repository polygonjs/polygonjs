import {ChannelData, ChannelInterpolation} from './KeyframeCommon';

const SAMPLE_DATA0: ChannelData = {
	keyframes: [
		{
			pos: 0,
			value: 0,
			in: {slope: 0, accel: 20},
		},
		{
			pos: 100,
			value: 1,
			in: {slope: 0, accel: 20},
		},
		{
			pos: 200,
			value: 0,
			in: {slope: 0, accel: 20},
		},
	],
	interpolation: ChannelInterpolation.CUBIC,
};
const SAMPLE_DATA: ChannelData[] = [SAMPLE_DATA0];

export function sampleData0() {
	return JSON.parse(JSON.stringify(SAMPLE_DATA0)) as ChannelData;
}
export function sampleData() {
	return JSON.parse(JSON.stringify(SAMPLE_DATA)) as ChannelData[];
}
