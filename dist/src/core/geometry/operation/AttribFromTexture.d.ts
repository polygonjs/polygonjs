import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { Texture } from 'three/src/textures/Texture';
interface AttribFromTextureParams {
    geometry: BufferGeometry;
    texture: Texture;
    uv_attrib_name: string;
    target_attrib_name: string;
    target_attrib_size: 1 | 2 | 3;
    add: number;
    mult: number;
}
export declare class AttribFromTexture {
    set_attrib(params: AttribFromTextureParams): void;
    private _data_from_texture;
    private _data_from_default_texture;
    private _data_from_data_texture;
}
export {};
