import { TypedRopNode } from './_Base';
import { CSS2DRenderer } from '../../../../modules/three/examples/jsm/renderers/CSS2DRenderer';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class WebGlRendererRopParamsConfig extends NodeParamsConfig {
    css: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class Css2DRendererRopNode extends TypedRopNode<WebGlRendererRopParamsConfig> {
    params_config: WebGlRendererRopParamsConfig;
    static type(): Readonly<'css2d_renderer'>;
    private _renderers_by_canvas_id;
    create_renderer(canvas: HTMLCanvasElement): CSS2DRenderer;
    renderer(canvas: HTMLCanvasElement): CSS2DRenderer;
    cook(): void;
}
export {};
