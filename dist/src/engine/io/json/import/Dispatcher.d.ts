import { BaseNodeType } from '../../../nodes/_Base';
import { BaseParamType } from '../../../params/_Base';
import { NodeJsonImporter } from './Node';
import { ParamJsonImporter } from './Param';
export declare class JsonImportDispatcher {
    static dispatch_node(node: BaseNodeType): NodeJsonImporter<BaseNodeType>;
    static dispatch_param(param: BaseParamType): ParamJsonImporter<BaseParamType>;
}
