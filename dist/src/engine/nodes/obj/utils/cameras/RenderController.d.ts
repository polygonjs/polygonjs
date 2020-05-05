import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Vector2 } from 'three/src/math/Vector2';
import { Scene } from 'three/src/scenes/Scene';
import { BaseThreejsCameraObjNodeType } from '../../_BaseCamera';
export declare function CameraRenderParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        render: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.FOLDER>;
        use_custom_scene: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        scene: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & TBase;
export declare class RenderController {
    private node;
    private _renderers_by_canvas_id;
    private _resolution_by_canvas_id;
    private _resolved_scene;
    constructor(node: BaseThreejsCameraObjNodeType);
    render(canvas: HTMLCanvasElement, size?: Vector2, aspect?: number): void;
    get resolved_scene(): Scene | undefined;
    update_scene(): Promise<void>;
    renderer(canvas: HTMLCanvasElement): WebGLRenderer;
    create_renderer(canvas: HTMLCanvasElement, size: Vector2): WebGLRenderer;
    delete_renderer(canvas: HTMLCanvasElement): void;
    canvas_resolution(canvas: HTMLCanvasElement): Vector2;
    set_renderer_size(canvas: HTMLCanvasElement, size: Vector2): void;
}
