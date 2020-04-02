import { TypedEventNode } from './_Base';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
import { BaseCameraObjNodeType } from '../obj/_BaseCamera';
import { Vector2 } from 'three/src/math/Vector2';
import { Raycaster } from 'three/src/core/Raycaster';
export declare class BaseMouseEventProcessor {
    protected node: CodeEventNode;
    protected raycaster: Raycaster;
    protected mouse: Vector2;
    constructor();
    process_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType): void;
    set_node(node: CodeEventNode): void;
    protected _set_mouse_from_event_and_canvas(event: MouseEvent, canvas: HTMLCanvasElement): void;
}
declare class CodeEventParamsConfig extends NodeParamsConfig {
    code_typescript: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    code_javascript: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class CodeEventNode extends TypedEventNode<CodeEventParamsConfig> {
    params_config: CodeEventParamsConfig;
    private _last_compiled_code;
    private _event_processor;
    static type(): string;
    initialize_node(): void;
    process_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType): void;
    private _compile_if_required;
    private _compile;
}
export {};
