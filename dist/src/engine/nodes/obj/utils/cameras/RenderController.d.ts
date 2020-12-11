import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Vector2 } from 'three/src/math/Vector2';
import { Scene } from 'three/src/scenes/Scene';
import { BaseThreejsCameraObjNodeType } from '../../_BaseCamera';
export declare function CameraRenderParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        render: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.FOLDER>;
        set_scene: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        scene: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        set_renderer: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        renderer: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        set_css_renderer: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.BOOLEAN>;
        css_renderer: import("../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
    };
} & TBase;
export declare class RenderController {
    private node;
    private _renderers_by_canvas_id;
    private _resolution_by_canvas_id;
    private _resolved_scene;
    private _resolved_renderer_rop;
    private _resolved_css_renderer_rop;
    constructor(node: BaseThreejsCameraObjNodeType);
    render(canvas: HTMLCanvasElement, size?: Vector2, aspect?: number): void;
    render_with_renderer(canvas: HTMLCanvasElement): void;
    update(): Promise<void>;
    get resolved_scene(): Scene | undefined;
    private update_scene;
    private update_renderer;
    private update_css_renderer;
    renderer(canvas: HTMLCanvasElement): WebGLRenderer;
    css_renderer(canvas: HTMLCanvasElement): import("../../../../../modules/core/renderers/CSS2DRenderer").CSS2DRenderer | import("../../../../../modules/three/examples/jsm/renderers/CSS3DRenderer").CSS3DRenderer | undefined;
    private _super_sampling_size;
    create_renderer(canvas: HTMLCanvasElement, size: Vector2): WebGLRenderer | undefined;
    private static _create_default_renderer;
    delete_renderer(canvas: HTMLCanvasElement): void;
    canvas_resolution(canvas: HTMLCanvasElement): Vector2;
    set_renderer_size(canvas: HTMLCanvasElement, size: Vector2): void;
}
