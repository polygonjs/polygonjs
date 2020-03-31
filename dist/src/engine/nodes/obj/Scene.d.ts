import { TypedObjNode } from './_Base';
import { Scene } from 'three/src/scenes/Scene';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class SceneObjParamConfig extends NodeParamsConfig {
    bg_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
}
export declare class SceneObjNode extends TypedObjNode<Scene, SceneObjParamConfig> {
    params_config: SceneObjParamConfig;
    static type(): string;
    create_object(): Scene;
    initialize_node(): void;
    cook(): void;
}
export {};
