import type {Intersection} from 'three';
import type {BaseNodeType} from '../../engine/nodes/_Base';
import type {BaseViewerType} from '../../engine/viewers/_Base';
import type {CoreEventEmitter} from './CoreEventEmitter';

interface EventContextValue {
	node?: BaseNodeType; // for node_cook
	intersect?: Intersection; // for raycast
}

export interface EventContext<E extends Event> {
	viewer?: Readonly<BaseViewerType>;
	event?: Readonly<E>;
	emitter?: CoreEventEmitter;
	// camera?: Readonly<Camera>;
	value?: EventContextValue;
}
