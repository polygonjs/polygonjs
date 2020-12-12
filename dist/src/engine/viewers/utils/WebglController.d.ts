import { BaseViewerType } from '../_Base';
export declare class WebGLController {
    protected viewer: BaseViewerType;
    request_animation_frame_id: number | undefined;
    constructor(viewer: BaseViewerType);
    init(): void;
    protected _on_webglcontextlost(): void;
    protected _on_webglcontextrestored(): void;
}
