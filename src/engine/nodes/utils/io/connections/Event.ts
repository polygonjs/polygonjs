//
//
// Event Data types
//
//

export enum EventConnectionPointType {
	BASE = 'base',
	DRAG = 'drag',
	KEYBOARD = 'keyboard',
	MOUSE = 'mouse',
	POINTER = 'pointer',
}
// interface IEventConnectionPointType {
// 	[EventConnectionPointType.BASE]: Readonly<'base'>;
// 	[EventConnectionPointType.KEYBOARD]: Readonly<'keyboard'>;
// 	[EventConnectionPointType.MOUSE]: Readonly<'mouse'>;
// }

// export const ConnectionPointTypeGL: IEventConnectionPointType = {
// 	[EventConnectionPointType.BASE]: 'base',
// 	[EventConnectionPointType.KEYBOARD]: 'keyboard',
// 	[EventConnectionPointType.MOUSE]: 'mouse',
// };

//
//
// ALL Event Data types in an array
//
//
export const EVENT_CONNECTION_POINT_TYPES: Array<EventConnectionPointType> = [
	EventConnectionPointType.BASE,
	EventConnectionPointType.DRAG,
	EventConnectionPointType.KEYBOARD,
	EventConnectionPointType.MOUSE,
	EventConnectionPointType.POINTER,
];

export interface EventConnectionPointData<T extends EventConnectionPointType> {
	name: string;
	type: T;
	isArray?: boolean;
}

import {BaseConnectionPoint} from './_Base';
import {EventContext} from '../../../../scene/utils/events/_BaseEventsController';
import {ParamType} from '../../../../poly/ParamType';
export class EventConnectionPoint<T extends EventConnectionPointType> extends BaseConnectionPoint {
	protected override _json: EventConnectionPointData<T> | undefined;

	constructor(
		protected override _name: string,
		protected override _type: T, // protected _init_value?: ConnectionPointInitValueMapGeneric[T]
		protected _event_listener?: (event_context: EventContext<any>) => void
	) {
		super(_name, _type);
		// if (this._init_value === undefined) {
		// this._init_value = null
		// }
	}
	override type() {
		return this._type;
	}
	get param_type() {
		return ParamType.FLOAT; // should never be used anyway
	}
	override are_types_matched(src_type: string, dest_type: string): boolean {
		if (dest_type == EventConnectionPointType.BASE) {
			return true;
		} else {
			return src_type == dest_type;
		}
	}
	get event_listener() {
		return this._event_listener;
	}
	// get param_type(): IConnectionPointTypeToParamTypeMap[T] {
	// 	return ConnectionPointTypeToParamTypeMap[this._type];
	// }
	// get init_value() {
	// 	return this._init_value;
	// }

	override toJSON(): EventConnectionPointData<T> {
		return (this._json = this._json || this._create_json());
	}
	protected override _create_json(): EventConnectionPointData<T> {
		return {
			name: this._name,
			type: this._type,
			isArray: false,
		};
	}
}

export type BaseEventConnectionPoint = EventConnectionPoint<EventConnectionPointType>;
