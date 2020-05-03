import { BaseNodeType } from '../../../nodes/_Base';
import { BaseParamType } from '../../../params/_Base';
import { NodeCodeExporter } from './Node';
import { ParamCodeExporter } from './Param';
export declare class CodeExporterDispatcher {
    static dispatch_node(node: BaseNodeType): NodeCodeExporter;
    static dispatch_param(param: BaseParamType): ParamCodeExporter<BaseParamType>;
}
