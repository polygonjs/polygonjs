import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Vector2 } from 'three/src/math/Vector2';
import { BaseCameraObjNodeType } from '../../_BaseCamera';
export declare function CameraPostProcessParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        post_process: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.FOLDER>;
        do_post_process: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        use_post_process_node0: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node0: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        use_post_process_node1: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node1: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        use_post_process_node2: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node2: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        use_post_process_node3: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        post_process_node3: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & TBase;
export declare class PostProcessController {
    private node;
    private _renderers_by_canvas_id;
    private _composers_by_canvas_id;
    private _resolution_by_canvas_id;
    private _composers_set_in_progress_by_canvas_id;
    private _fetch_post_process_nodes_in_progress;
    private _post_process_nodes;
    private _post_process_use_node_path_params;
    private _post_process_node_path_params;
    constructor(node: BaseCameraObjNodeType);
    render(canvas: HTMLCanvasElement, size: Vector2, aspect: number): void;
    private renderer;
    create_renderer(canvas: HTMLCanvasElement, size: Vector2): WebGLRenderer;
    delete_renderer(canvas: HTMLCanvasElement): void;
    set_renderer_size(canvas: HTMLCanvasElement, size: Vector2): void;
    private composer;
    private _create_composer;
    update_composer_passes(): Promise<void>;
    private set_composers_passes;
    private set_composer_passes;
    private clear_render_passes;
    private composer_passes_nodes_changed;
}
