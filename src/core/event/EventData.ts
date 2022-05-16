import {CoreEventEmitter} from './CoreEventEmitter';

export interface EventData {
	type: string;
	emitter: CoreEventEmitter;
}
