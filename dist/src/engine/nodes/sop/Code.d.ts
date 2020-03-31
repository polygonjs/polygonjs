import { TypedSopNode } from './_Base';
import { CoreGroup } from '../../../core/geometry/Group';
import { NodeParamsConfig } from '../utils/params/ParamsConfig';
declare class CodeSopParamsConfig extends NodeParamsConfig {
    code_typescript: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
    code_javascript: import("../utils/params/ParamsConfig").ParamTemplate<import("../../poly/ParamType").ParamType.STRING>;
}
export declare class CodeSopNode extends TypedSopNode<CodeSopParamsConfig> {
    params_config: CodeSopParamsConfig;
    private _last_compiled_code;
    private _function;
    static type(): string;
    initialize_node(): void;
    cook(core_groups: CoreGroup[]): void;
    private _compile_if_required;
    private _compile;
}
export {};
