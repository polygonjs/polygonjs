import { TypedRopNode } from './_Base';
import { CSS2DRenderer } from '../../../modules/core/renderers/CSS2DRenderer';
import { RopType } from '../../poly/registers/nodes/Rop';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class Css2DRendererRopParamsConfig extends NodeParamsConfig {
    css: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    sort_objects: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    use_fog: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    fog_near: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    fog_far: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class Css2DRendererRopNode extends TypedRopNode<Css2DRendererRopParamsConfig> {
    params_config: Css2DRendererRopParamsConfig;
    static type(): Readonly<RopType.CSS2D>;
    private _renderers_by_canvas_id;
    create_renderer(canvas: HTMLCanvasElement): CSS2DRenderer;
    renderer(canvas: HTMLCanvasElement): CSS2DRenderer;
    cook(): void;
    private _update_renderer;
    private _update_css;
    private _css_element;
    private css_element;
    private _find_element;
    private _create_element;
    private _css_element_id;
}
export {};
