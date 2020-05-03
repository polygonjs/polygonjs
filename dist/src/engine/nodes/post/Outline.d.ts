import { TypedPostProcessNode, TypedPostNodeContext } from './_Base';
import { OutlinePass } from '../../../../modules/three/examples/jsm/postprocessing/OutlinePass';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class OutlinePostParamsConfig extends NodeParamsConfig {
    edge_strength: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    pulse_period: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.FLOAT>;
    visible_edge_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
    hidden_edge_color: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.COLOR>;
}
export declare class OutlinePostNode extends TypedPostProcessNode<OutlinePass, OutlinePostParamsConfig> {
    params_config: OutlinePostParamsConfig;
    static type(): string;
    protected _create_pass(context: TypedPostNodeContext): OutlinePass;
    update_pass(pass: OutlinePass): void;
}
export {};
