import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Texture } from 'three/src/textures/Texture';
import { WebGLRenderTarget, WebGLRenderTargetOptions } from 'three/src/renderers/WebGLRenderTarget';
interface RendererByString {
    [propName: string]: WebGLRenderer;
}
interface TextureByString {
    [propName: string]: Texture;
}
export declare class RenderersController {
    _next_renderer_id: number;
    _next_env_map_id: number;
    _renderers: RendererByString;
    _env_maps: TextureByString;
    private _require_webgl2;
    private _resolves;
    private _webgl2_available;
    constructor();
    set_require_webgl2(): void;
    webgl2_available(): boolean;
    private _set_webgl2_available;
    rendering_context(canvas: HTMLCanvasElement): WebGLRenderingContext;
    private _rendering_context_webgl;
    register_renderer(renderer: WebGLRenderer): void;
    deregister_renderer(renderer: WebGLRenderer): void;
    first_renderer(): WebGLRenderer | null;
    renderers(): WebGLRenderer[];
    private flush_callbacks_with_renderer;
    wait_for_renderer(): Promise<WebGLRenderer>;
    render_target(width: number, height: number, parameters: WebGLRenderTargetOptions): WebGLRenderTarget;
}
export {};
