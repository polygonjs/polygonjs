import { TypedCopNode } from '../_Base';
import { Texture } from 'three/src/textures/Texture';
import { NodeParamsConfig } from '../../utils/params/ParamsConfig';
export declare function TextureParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        tencoding: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        encoding: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        tmapping: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        mapping: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        twrap: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        wrap_s: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        wrap_t: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        wrap_sep: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.SEPARATOR>;
        tminfilter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        min_filter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        tmagfilter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        mag_filter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        tanisotropy: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        use_renderer_max_anisotropy: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        anisotropy: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        use_camera_renderer: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        anisotropy_sep: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.SEPARATOR>;
        tflip_y: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        flip_y: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        ttransform: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        offset: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR2>;
        repeat: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR2>;
        rotation: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        center: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR2>;
    };
} & TBase;
declare const TextureParamsConfig_base: {
    new (...args: any[]): {
        tencoding: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        encoding: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        tmapping: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        mapping: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        twrap: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        wrap_s: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        wrap_t: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        wrap_sep: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.SEPARATOR>;
        tminfilter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        min_filter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        tmagfilter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        mag_filter: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        tanisotropy: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        use_renderer_max_anisotropy: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        anisotropy: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.INTEGER>;
        use_camera_renderer: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        anisotropy_sep: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.SEPARATOR>;
        tflip_y: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        flip_y: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        ttransform: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.BOOLEAN>;
        offset: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR2>;
        repeat: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR2>;
        rotation: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.FLOAT>;
        center: import("../../utils/params/ParamsConfig").ParamTemplate<import("../../../poly/ParamType").ParamType.VECTOR2>;
    };
} & typeof NodeParamsConfig;
declare class TextureParamsConfig extends TextureParamsConfig_base {
}
declare class TextureCopNode extends TypedCopNode<TextureParamsConfig> {
    params_config: TextureParamsConfig;
    readonly texture_params_controller: TextureParamsController;
}
export declare class TextureParamsController {
    protected node: TextureCopNode;
    constructor(node: TextureCopNode);
    update(texture: Texture): void;
    private _renderer_controller;
    private _update_anisotropy;
    private _update_texture_transform;
    private _update_offset;
    private _update_repeat;
    private _update_rotation;
    private _update_center;
    static PARAM_CALLBACK_update_offset(node: TextureCopNode): void;
    static PARAM_CALLBACK_update_repeat(node: TextureCopNode): void;
    static PARAM_CALLBACK_update_rotation(node: TextureCopNode): void;
    static PARAM_CALLBACK_update_center(node: TextureCopNode): void;
}
export {};
