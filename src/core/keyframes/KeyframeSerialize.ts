import {ChannelData, KeyframeData, KeyframeDataBasic, KeyframeDataSplit} from './KeyframeCommon';

export function channelDataFromString(content: string, target: ChannelData) {
	try {
		const json = JSON.parse(content);
		copyChannelData(json, target);
	} catch (e) {}
}

export function channelDataToString(data: ChannelData): string {
	return JSON.stringify(data);
}

export function copykeyframeData(src: KeyframeData, target: KeyframeData) {
	target.pos = src.pos;
	target.value = src.value;
	if ((src as KeyframeDataBasic).inOut) {
		(target as KeyframeDataBasic).inOut = (src as KeyframeDataBasic).inOut;
		delete (target as any)['in'];
		delete (target as any)['out'];
	} else {
		(target as KeyframeDataSplit).in = (src as KeyframeDataSplit).in;
		(target as KeyframeDataSplit).out = (src as KeyframeDataSplit).out;
		delete (target as any)['inOut'];
	}
}
export function keyframeTangentSplit(keyframe: KeyframeData) {
	if ((keyframe as KeyframeDataBasic).inOut) {
		const inOut = (keyframe as KeyframeDataBasic).inOut;
		delete (keyframe as any)['inOut'];
		(keyframe as KeyframeDataSplit).in = {x: inOut.x, y: inOut.y};
		(keyframe as KeyframeDataSplit).out = {x: inOut.x, y: inOut.y};
	}
}
export function keyframeTangentMerge(keyframe: KeyframeData) {
	if ((keyframe as KeyframeDataBasic).inOut) {
		return;
	}
	const _in = (keyframe as KeyframeDataSplit).in;
	const _out = (keyframe as KeyframeDataSplit).out;
	delete (keyframe as any)['in'];
	delete (keyframe as any)['out'];
	(keyframe as KeyframeDataBasic).inOut = {x: (_in.x + _out.x) * 0.5, y: (_in.y + _out.y) * 0.5};
}
export function createKeyframeData() {
	return {pos: 0, value: 0, inOut: {x: 1, y: 0}};
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
		copykeyframeData(srcKeyframe, targetKeyframe);

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
