import { Vector2 } from 'three/src/math/Vector2';
import { BaseThreejsCameraObjNodeType } from '../../_BaseCamera';
import { EffectComposer } from '../../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
export declare function CameraPostProcessParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        do_post_process: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & TBase;
export declare class PostProcessController {
    private node;
    private _composers_by_canvas_id;
    constructor(node: BaseThreejsCameraObjNodeType);
    private _add_param_dirty_hook;
    render(canvas: HTMLCanvasElement, size?: Vector2): void;
    reset(): void;
    composer(canvas: HTMLCanvasElement): EffectComposer;
    private _create_composer;
}
