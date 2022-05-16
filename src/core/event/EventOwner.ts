import {CoreEventEmitter} from './CoreEventEmitter';
import {EventData} from './EventData';

function elementFromEmitterType(emitter: CoreEventEmitter, canvas: HTMLCanvasElement) {
	return emitter == CoreEventEmitter.CANVAS ? canvas : document;
}

export function getEventOwner(eventData: EventData, canvas: HTMLCanvasElement) {
	if (eventData.type == 'resize') {
		return window;
	} else {
		return elementFromEmitterType(eventData.emitter, canvas);
	}
}
