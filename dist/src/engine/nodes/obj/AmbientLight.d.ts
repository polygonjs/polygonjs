import { AmbientLight } from 'three/src/lights/AmbientLight';
import { TypedLightObjNode } from './_BaseLight';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class AmbientLightObjParamsConfig extends NodeParamsConfig {
    color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    intensity: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
}
export declare class AmbientLightObjNode extends TypedLightObjNode<AmbientLight, AmbientLightObjParamsConfig> {
    params_config: AmbientLightObjParamsConfig;
    static type(): string;
    create_light(): AmbientLight;
    initialize_node(): void;
    update_light_params(): void;
}
export {};
