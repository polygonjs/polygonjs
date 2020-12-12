import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { ParamOptions } from '../../params/utils/OptionsController';
export declare const EVENT_PARAM_OPTIONS: ParamOptions;
export declare abstract class TypedInputEventNode<K extends NodeParamsConfig> extends TypedEventNode<K> {
    initialize_base_node(): void;
    process_event(event_context: EventContext<Event>): void;
    static PARAM_CALLBACK_update_register(node: BaseInputEventNodeType): void;
    private _update_register;
    private _active_event_names;
    private _update_active_event_names;
    protected abstract accepted_event_types(): string[];
    active_event_names(): string[];
}
export declare type BaseInputEventNodeType = TypedInputEventNode<any>;
export declare class BaseInputEventNodeClass extends TypedInputEventNode<any> {
    accepted_event_types(): never[];
}
