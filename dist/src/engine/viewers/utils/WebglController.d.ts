import { BaseViewer } from '../_Base';
export declare class WebGLController {
    protected viewer: BaseViewer;
    request_animation_frame_id: number | undefined;
    constructor(viewer: BaseViewer);
    init(): void;
    protected _on_webglcontextlost(): void;
    protected _on_webglcontextrestored(): void;
}
