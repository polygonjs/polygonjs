import { TypedEventNode } from './_Base';
import { EventContext } from '../../scene/utils/events/_BaseEventsController';
import { Vector2 } from 'three/src/math/Vector2';
import { Raycaster } from 'three/src/core/Raycaster';
export declare class BaseCodeEventProcessor {
    protected node: CodeEventNode;
    protected raycaster: Raycaster;
    protected mouse: Vector2;
    constructor(node: CodeEventNode);
    process_event(event_context: EventContext<Event>): void;
    process_mouse_event(event_context: EventContext<MouseEvent>): void;
    process_keyboard_event(event_context: EventContext<KeyboardEvent>): void;
    set_node(node: CodeEventNode): void;
    initialize_processor(): void;
    protected _set_mouse_from_event_and_canvas(event: MouseEvent, canvas: HTMLCanvasElement): void;
}
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class CodeEventParamsConfig extends NodeParamsConfig {
    code_typescript: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    code_javascript: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class CodeEventNode extends TypedEventNode<CodeEventParamsConfig> {
    params_config: CodeEventParamsConfig;
    private _last_compiled_code;
    private _processor;
    static type(): string;
    initialize_node(): void;
    process_event(event_context: EventContext<Event>): void;
    private _compile_if_required;
    private _compile;
}
export {};
