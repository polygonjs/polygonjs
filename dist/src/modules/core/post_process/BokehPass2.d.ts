import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Scene } from 'three/src/scenes/Scene';
import { IUniformN, IUniformTexture, IUniformV2 } from '../../../engine/nodes/utils/code/gl/Uniforms';
import { Vector2 } from 'three/src/math/Vector2';
import { Color } from 'three/src/math/Color';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { IUniform } from 'three/src/renderers/shaders/UniformsLib';
import { DepthOfFieldPostNode } from '../../../engine/nodes/post/DepthOfField';
interface BokehUniforms {
    tColor: IUniformTexture;
    tDepth: IUniformTexture;
    textureWidth: IUniformN;
    textureHeight: IUniformN;
    fstop: IUniformN;
    maxblur: IUniformN;
    threshold: IUniformN;
    gain: IUniformN;
    bias: IUniformN;
    fringe: IUniformN;
    dithering: IUniformN;
    focalLength: IUniformN;
    znear: IUniformN;
    zfar: IUniformN;
    focalDepth: IUniformN;
    noise: IUniformN;
    pentagon: IUniformN;
    vignetting: IUniformN;
    depthblur: IUniformN;
    shaderFocus: IUniformN;
    showFocus: IUniformN;
    manualdof: IUniformN;
    focusCoords: IUniformV2;
    [uniform: string]: IUniform;
}
interface BokehShaderMaterial extends ShaderMaterial {
    uniforms: BokehUniforms;
    defines: {
        RINGS: number;
        SAMPLES: number;
    };
}
export declare class BokehPass2 {
    private _depth_of_field_node;
    private _scene;
    private _camera;
    private _resolution;
    private _core_scene;
    private materialDepth;
    private materialDepthInstance;
    private _camera_uniforms;
    enabled: boolean;
    needsSwap: boolean;
    clear: boolean;
    renderToScreen: boolean;
    private _processing_scene;
    private _processing_camera;
    private _rtTextureDepth;
    private _rtTextureColor;
    bokeh_uniforms: BokehUniforms;
    bokeh_material: BokehShaderMaterial;
    private _quad;
    clear_color: Color;
    constructor(_depth_of_field_node: DepthOfFieldPostNode, _scene: Scene, _camera: PerspectiveCamera, _resolution: Vector2);
    setSize(width: number, height: number): void;
    dispose(): void;
    render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget): void;
    update_camera_uniforms_with_node(node: DepthOfFieldPostNode, camera: PerspectiveCamera): void;
}
export {};
