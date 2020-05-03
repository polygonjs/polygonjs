import { TypedObjNode } from './_Base';
import { Scene } from 'three/src/scenes/Scene';
import { Fog } from 'three/src/scenes/Fog';
import { FogExp2 } from 'three/src/scenes/FogExp2';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SceneObjParamConfig extends NodeParamsConfig {
    auto_update: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    background_mode: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    bg_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    bg_texture: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    use_environment: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    environment: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
    use_fog: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    fog_type: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.INTEGER>;
    fog_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    fog_near: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    fog_far: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    fog_density: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    use_override_material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    override_material: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.OPERATOR_PATH>;
}
export declare class SceneObjNode extends TypedObjNode<Scene, SceneObjParamConfig> {
    params_config: SceneObjParamConfig;
    static type(): string;
    protected _attachable_to_hierarchy: boolean;
    private _fog;
    private _fog_exp2;
    create_object(): Scene;
    initialize_node(): void;
    private _cook_main_without_inputs_when_dirty_bound;
    private _cook_main_without_inputs_when_dirty;
    cook(): void;
    private _update_background;
    private _update_fog;
    get fog(): Fog;
    get fog_exp2(): FogExp2;
    private _update_enviromment;
    private _update_material_override;
}
export {};
