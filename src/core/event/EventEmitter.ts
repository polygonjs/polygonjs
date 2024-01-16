import {CoreEventEmitter, EmitterElementOrWindow} from './CoreEventEmitter';
import {EventData} from './EventData';
import {WindowEventType} from './WindowEventType';

function elementFromEmitterType(emitter: CoreEventEmitter, canvas: HTMLCanvasElement) {
	return emitter == CoreEventEmitter.CANVAS ? canvas : document;
}

export function getEventEmitter(eventData: EventData, canvas: HTMLCanvasElement): EmitterElementOrWindow {
	if (eventData.type == WindowEventType.resize) {
		return window;
	} else {
		return elementFromEmitterType(eventData.emitter, canvas);
	}
}
