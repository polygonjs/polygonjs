import { TypedEventNode } from './_Base';
import { BaseCameraObjNodeType } from '../obj/_BaseCamera';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class MouseEventParamsConfig extends NodeParamsConfig {
    active: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
}
export declare class MouseEventNode extends TypedEventNode<MouseEventParamsConfig> {
    params_config: MouseEventParamsConfig;
    static type(): string;
    initialize_node(): void;
    process_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType): void;
    _update_register(): void;
    static PARAM_CALLBACK_toggle_active(node: MouseEventNode): void;
}
export {};
