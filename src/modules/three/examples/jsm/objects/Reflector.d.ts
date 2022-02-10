import { Mesh, BufferGeometry, ColorRepresentation, TextureEncoding, WebGLRenderTarget } from 'three';

export interface ReflectorOptions {
    color?: ColorRepresentation;
    textureWidth?: number;
    textureHeight?: number;
    clipBias?: number;
    shader?: object;
    encoding?: TextureEncoding;
}

export class Reflector extends Mesh {
    constructor(geometry?: BufferGeometry, options?: ReflectorOptions);

    getRenderTarget(): WebGLRenderTarget;

    dispose(): void;
}
