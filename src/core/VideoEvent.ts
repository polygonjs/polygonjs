export enum VideoEvent {
	PLAY = 'play',
	PAUSE = 'pause',
	TIME_UPDATE = 'timeupdate',
	VOLUME_CHANGE = 'volumechange',
}
export const VIDEO_EVENTS: VideoEvent[] = [
	VideoEvent.PLAY,
	VideoEvent.PAUSE,
	VideoEvent.TIME_UPDATE,
	VideoEvent.VOLUME_CHANGE,
];
function _buildVideoEventIndices() {
	const map: Map<VideoEvent, number> = new Map();
	let i = 0;
	for (let eventName of VIDEO_EVENTS) {
		map.set(eventName, i);
		i++;
	}
	return map;
}
export const VIDEO_EVENT_INDICES = _buildVideoEventIndices();
