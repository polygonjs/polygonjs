import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
interface RendererConfig {
    canvas: HTMLCanvasElement;
    renderer: WebGLRenderer;
    viewer: WebGLRenderer;
}
export declare class RendererUtils {
    private static _configs;
    static wait_for_renderer(): Promise<RendererConfig>;
    static dispose(): void;
}
export {};
