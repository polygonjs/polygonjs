//
//
// Event Data types
//
//

export enum EventConnectionPointType {
	BASE = 'base',
	KEYBOARD = 'keyboard',
	MOUSE = 'mouse',
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
// export const ConnectionPointTypesEVENT: Array<EventConnectionPointType> = [
// 	EventConnectionPointType.BASE,
// 	EventConnectionPointType.KEYBOARD,
// 	EventConnectionPointType.MOUSE,
// ];

export interface EventConnectionPointData<T extends EventConnectionPointType> {
	name: string;
	type: T;
}

import {BaseConnectionPoint} from './_Base';
export class EventConnectionPoint<T extends EventConnectionPointType> extends BaseConnectionPoint {
	protected _json: EventConnectionPointData<T> | undefined;

	constructor(
		protected _name: string,
		protected _type: T // protected _init_value?: ConnectionPointInitValueMapGeneric[T]
	) {
		super(_name, _type);
		// if (this._init_value === undefined) {
		// this._init_value = null
		// }
	}
	get name() {
		return this._name;
	}
	get type() {
		return this._type;
	}
	// get param_type(): IConnectionPointTypeToParamTypeMap[T] {
	// 	return ConnectionPointTypeToParamTypeMap[this._type];
	// }
	// get init_value() {
	// 	return this._init_value;
	// }

	to_json(): EventConnectionPointData<T> {
		return (this._json = this._json || this._create_json());
	}
	protected _create_json(): EventConnectionPointData<T> {
		return {
			name: this._name,
			type: this._type,
		};
	}
}

export type BaseEventConnectionPoint = EventConnectionPoint<EventConnectionPointType>;
