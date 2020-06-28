import { Css2DRendererRopNode } from '../../../nodes/rop/Css2DRenderer';
import { WebGlRendererRopNode } from '../../../nodes/rop/WebGLRenderer';
export interface RopNodeChildrenMap {
    css2d_renderer: Css2DRendererRopNode;
    webgl_renderer: WebGlRendererRopNode;
}
import { Poly } from '../../../Poly';
export declare class RopRegister {
    static run(poly: Poly): void;
}
