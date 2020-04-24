import { HemisphereLight } from 'three/src/lights/HemisphereLight';
import { TypedLightObjNode } from './_BaseLight';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class HemisphereLightObjParamsConfig extends NodeParamsConfig {
    sky_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    ground_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    intensity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    position: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.VECTOR3>;
    show_helper: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.BOOLEAN>;
    helper_size: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class HemisphereLightObjNode extends TypedLightObjNode<HemisphereLight, HemisphereLightObjParamsConfig> {
    params_config: HemisphereLightObjParamsConfig;
    static type(): string;
    private _helper_controller;
    create_light(): HemisphereLight;
    initialize_node(): void;
    update_light_params(): void;
}
export {};
