import { Css2DRendererRopNode } from '../../../nodes/rop/Css2DRenderer';
import { Css3DRendererRopNode } from '../../../nodes/rop/Css3DRenderer';
import { WebGlRendererRopNode } from '../../../nodes/rop/WebGLRenderer';
export declare enum RopType {
    CSS2D = "css2d_renderer",
    CSS3D = "css3d_renderer",
    WEBGL = "webgl_renderer"
}
export interface RopNodeChildrenMap {
    css2d_renderer: Css2DRendererRopNode;
    css3d_renderer: Css3DRendererRopNode;
    webgl_renderer: WebGlRendererRopNode;
}
import { Poly } from '../../../Poly';
export declare class RopRegister {
    static run(poly: Poly): void;
}
