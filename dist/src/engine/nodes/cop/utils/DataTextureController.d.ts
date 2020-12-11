import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { DataTexture } from 'three/src/textures/DataTexture';
import { Texture } from 'three/src/textures/Texture';
export declare enum DataTextureControllerBufferType {
    Uint8Array = "Uint8Array",
    Uint8ClampedArray = "Uint8ClampedArray",
    Float32Array = "Float32Array"
}
export declare class DataTextureController {
    private buffer_type;
    private _data_texture;
    constructor(buffer_type: DataTextureControllerBufferType);
    from_render_target(renderer: WebGLRenderer, render_target: WebGLRenderTarget): DataTexture;
    from_texture(texture: Texture): DataTexture;
    get data_texture(): DataTexture | undefined;
    reset(): void;
    private _copy_to_data_texture;
    private _create_data_texture;
    private _create_pixel_buffer;
    private _same_dimensions;
}
