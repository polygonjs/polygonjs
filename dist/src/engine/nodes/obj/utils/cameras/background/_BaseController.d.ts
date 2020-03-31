import { Raycaster } from 'three/src/core/Raycaster';
import { Mesh } from 'three/src/objects/Mesh';
import { Color } from 'three/src/math/Color';
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { BaseCameraObjNodeType } from '../../../_BaseCamera';
export declare function CameraBackgroundParamConfig<TBase extends Constructor>(Base: TBase): {
    new (...args: any[]): {
        background: import("../../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../../poly/ParamType").ParamType.FOLDER>;
        use_background: import("../../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../../poly/ParamType").ParamType.BOOLEAN>;
        use_material: import("../../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../../poly/ParamType").ParamType.BOOLEAN>;
        background_color: import("../../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../../poly/ParamType").ParamType.COLOR>;
        background_material: import("../../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../../poly/ParamType").ParamType.OPERATOR_PATH>;
        background_ratio: import("../../../../utils/params/ParamsConfig").ParamTemplate<import("../../../../../poly/ParamType").ParamType.FLOAT>;
    };
} & TBase;
export declare class BaseBackgroundController {
    protected node: BaseCameraObjNodeType;
    private _screen_quad;
    private _screen_quad_flat_material;
    protected _bg_raycaster: Raycaster;
    constructor(node: BaseCameraObjNodeType);
    get screen_quad(): Mesh;
    private _create_screen_quad;
    screen_quad_flat_material(): MeshBasicMaterial;
    add_params(): void;
    get use_background(): boolean;
    get use_background_material(): boolean;
    get use_background_color(): boolean;
    get background_color(): Color | null;
    protected update_screen_quad(): void;
    update(): Promise<void>;
    private update_background_color;
    private update_background_material;
}
