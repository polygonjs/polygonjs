import { BaseNodeType } from '../../../nodes/_Base';
import { BaseParamType } from '../../../params/_Base';
import { NodeJsonExporter } from './Node';
import { ParamJsonExporter } from './Param';
export declare class JsonExportDispatcher {
    static dispatch_node(node: BaseNodeType): NodeJsonExporter<BaseNodeType>;
    static dispatch_param(param: BaseParamType): ParamJsonExporter<BaseParamType>;
}
