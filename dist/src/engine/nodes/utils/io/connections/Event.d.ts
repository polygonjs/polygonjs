export declare enum EventConnectionPointType {
    BASE = "base",
    KEYBOARD = "keyboard",
    MOUSE = "mouse"
}
export interface EventConnectionPointData<T extends EventConnectionPointType> {
    name: string;
    type: T;
}
import { BaseConnectionPoint } from './_Base';
import { EventContext } from '../../../../scene/utils/events/_BaseEventsController';
import { ParamType } from '../../../../poly/ParamType';
export declare class EventConnectionPoint<T extends EventConnectionPointType> extends BaseConnectionPoint {
    protected _name: string;
    protected _type: T;
    protected _event_listener?: ((event_context: EventContext<any>) => void) | undefined;
    protected _json: EventConnectionPointData<T> | undefined;
    constructor(_name: string, _type: T, // protected _init_value?: ConnectionPointInitValueMapGeneric[T]
    _event_listener?: ((event_context: EventContext<any>) => void) | undefined);
    get type(): T;
    get param_type(): ParamType;
    are_types_matched(src_type: string, dest_type: string): boolean;
    get event_listener(): ((event_context: EventContext<any>) => void) | undefined;
    to_json(): EventConnectionPointData<T>;
    protected _create_json(): EventConnectionPointData<T>;
}
export declare type BaseEventConnectionPoint = EventConnectionPoint<EventConnectionPointType>;
