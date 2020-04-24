import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
declare class MouseEventParamsConfig extends NodeParamsConfig {
    active: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class MouseEventNode extends TypedEventNode<MouseEventParamsConfig> {
    params_config: MouseEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event_context: EventContext<MouseEvent>): void;
    _update_register(): void;
    static PARAM_CALLBACK_toggle_active(node: MouseEventNode): void;
}
export {};
