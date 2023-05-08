import {isArray} from '../Type';
import {ChannelData, KeyframeData} from './KeyframeCommon';
import {createKeyframeTangent, copyKeyframeTangent} from './KeyframeTangent';

export function createKeyframeData(): KeyframeData {
	return {pos: 0, value: 0, in: {slope: 0, accel: 0}};
}

export function channelDataFromString(content: string, target: ChannelData[]) {
	try {
		let json = JSON.parse(content);
		if (isArray(json)) {
			let i = 0;
			for (let targetSubElement of target) {
				const jsonElement = json[i] || json[0];
				copyChannelData(jsonElement, targetSubElement);
				i++;
			}
		} else {
			for (let targetSubElement of target) {
				copyChannelData(json, targetSubElement);
			}
		}
	} catch (e) {
		console.warn('invalid channel data');
		console.log(e);
		console.log(target);
	}
}

export function channelDataToString(data: ChannelData[]): string {
	if (data.length == 1) {
		return JSON.stringify(data[0]);
	}
	return JSON.stringify(data);
}

export function copyKeyframeData(src: KeyframeData, target: KeyframeData) {
	target.pos = src.pos;
	target.value = src.value;
	copyKeyframeTangent(src.in, target.in);
	if (src.out) {
		if (!target.out) {
			target.out = createKeyframeTangent();
		}
		copyKeyframeTangent(src.out, target.out);
	} else {
		delete target.out;
	}
}

export function copyChannelData(src: ChannelData, target: ChannelData) {
	target.interpolation = src.interpolation;

	// remove non existing keys
	target.keyframes.splice(src.keyframes.length, target.keyframes.length);

	const srcKeyframes = src.keyframes;
	let i = 0;
	for (const srcKeyframe of srcKeyframes) {
		let targetKeyframe = target.keyframes[i];
		if (!targetKeyframe) {
			targetKeyframe = createKeyframeData();
			target.keyframes[i] = targetKeyframe;
		}
		copyKeyframeData(srcKeyframe, targetKeyframe);

		i++;
	}
}

// function copyChannelsData(src: ChannelsData, target: ChannelsData) {
// 	// const data: ChannelsData = {};
// 	const existingChannelNames = Object.keys(target);
// 	for (const channelName of existingChannelNames) {
// 		delete target[channelName];
// 	}

// 	const channelNames = Object.keys(src);
// 	for (const channelName of channelNames) {
// 		const targetChannelData: ChannelData = {keyframes: [], interpolation: src[channelName].interpolation};
// 		copyChannelData(src[channelName], targetChannelData);
// 		target[channelName] = targetChannelData;
// 	}
// }
