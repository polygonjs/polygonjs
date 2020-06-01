import { VideoTexture } from 'three/src/textures/VideoTexture';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { Texture } from 'three/src/textures/Texture';
import { BaseNodeType } from '../../engine/nodes/_Base';
import { BaseParamType } from '../../engine/params/_Base';
import { ModuleName } from '../../engine/poly/registers/modules/_BaseRegister';
interface VideoSourceTypeByExt {
    ogg: string;
    ogv: string;
    mp4: string;
}
export declare class CoreTextureLoader {
    private _node;
    private _param;
    static PARAM_DEFAULT: string;
    static PARAM_ENV_DEFAULT: string;
    static VIDEO_EXTENSIONS: string[];
    static VIDEO_SOURCE_TYPE_BY_EXT: VideoSourceTypeByExt;
    constructor(_node: BaseNodeType, _param: BaseParamType);
    load_texture_from_url_or_op(url: string): Promise<Texture | VideoTexture | null>;
    load_url(url: string): Promise<Texture>;
    static module_names(ext: string): ModuleName[] | void;
    loader_for_ext(ext: string): Promise<import("../../../modules/three/examples/jsm/loaders/EXRLoader").EXRLoader | import("../../../modules/three/examples/jsm/loaders/RGBELoader").RGBELoader | import("../../../modules/three/examples/jsm/loaders/BasisTextureLoader").BasisTextureLoader | TextureLoader | undefined>;
    private _exr_loader;
    private _hdr_loader;
    private _basic_loader;
    _load_as_video(url: string): Promise<VideoTexture>;
    static _default_video_source_type(url: string): string;
    static pixel_data(texture: Texture): ImageData | undefined;
    static get_extension(url: string): string;
    static set_texture_for_mapping(texture: Texture): Texture;
}
export {};
