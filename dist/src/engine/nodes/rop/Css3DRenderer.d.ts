import { TypedRopNode } from './_Base';
import { CSS3DRenderer } from '../../../modules/three/examples/jsm/renderers/CSS3DRenderer';
import { RopType } from '../../poly/registers/nodes/Rop';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class Css3DRendererRopParamsConfig extends NodeParamsConfig {
    css: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class Css3DRendererRopNode extends TypedRopNode<Css3DRendererRopParamsConfig> {
    params_config: Css3DRendererRopParamsConfig;
    static type(): Readonly<RopType.CSS3D>;
    private _renderers_by_canvas_id;
    create_renderer(canvas: HTMLCanvasElement): CSS3DRenderer;
    renderer(canvas: HTMLCanvasElement): CSS3DRenderer;
    cook(): void;
}
export {};
