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
    loader_for_ext(ext: string): Promise<import("../../modules/three/examples/jsm/loaders/BasisTextureLoader").BasisTextureLoader | import("../../modules/three/examples/jsm/loaders/EXRLoader").EXRLoader | import("../../modules/three/examples/jsm/loaders/RGBELoader").RGBELoader | TextureLoader | undefined>;
    private _exr_loader;
    private _hdr_loader;
    private _basis_loader;
    _load_as_video(url: string): Promise<VideoTexture>;
    static _default_video_source_type(url: string): string;
    static pixel_data(texture: Texture): ImageData | undefined;
    static get_extension(url: string): string;
    static replace_extension(url: string, new_extension: string): string;
    static set_texture_for_mapping(texture: Texture): Texture;
    private static MAX_CONCURRENT_LOADS_COUNT;
    private static CONCURRENT_LOADS_DELAY;
    private static in_progress_loads_count;
    private static _queue;
    private static _init_max_concurrent_loads_count;
    private static _init_concurrent_loads_delay;
    static override_max_concurrent_loads_count(count: number): void;
    private static increment_in_progress_loads_count;
    private static decrement_in_progress_loads_count;
    private static wait_for_max_concurrent_loads_queue_freed;
}
export {};
