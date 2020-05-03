import { Vector2 } from 'three/src/math/Vector2';
import { BaseThreejsCameraObjNodeType } from '../../_BaseCamera';
export declare function CameraPostProcessParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        do_post_process: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        prepend_render_pass: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        use_render_target: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
    };
} & TBase;
export declare class PostProcessController {
    private node;
    private _composers_by_canvas_id;
    constructor(node: BaseThreejsCameraObjNodeType);
    private _add_param_dirty_hook;
    render(canvas: HTMLCanvasElement, size?: Vector2): void;
    private _reset_composers;
    private composer;
    private _create_composer;
}
