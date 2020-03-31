import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { Texture } from 'three/src/textures/Texture';
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
    constructor();
    set_require_webgl2(): void;
    rendering_context(canvas: HTMLCanvasElement): WebGLRenderingContext;
    private _rendering_context_webgl;
    register_renderer(renderer: WebGLRenderer): void;
    deregister_renderer(renderer: WebGLRenderer): void;
    private first_renderer;
    renderers(): WebGLRenderer[];
    private flush_callbacks_with_renderer;
    wait_for_renderer(): Promise<WebGLRenderer>;
}
export {};
