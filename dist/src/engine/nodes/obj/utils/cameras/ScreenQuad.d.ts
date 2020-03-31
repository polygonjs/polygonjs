import { Texture } from 'three/src/textures/Texture';
interface ScreenQuadParams {
    debug?: boolean;
    texture?: Texture;
    fragmentShader?: string;
    width?: number;
    height?: number;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}
export declare const ScreenQuad: {
    (this: any, params: ScreenQuadParams): void;
    prototype: any;
    constructor: any;
};
export {};
