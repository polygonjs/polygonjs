import { BaseNodeType } from '../../../nodes/_Base';
import { BaseParamType } from '../../../params/_Base';
import { NodeJsonExporter } from './Node';
import { ParamJsonExporter } from './Param';
import { PolyNodeJsonExporter } from './nodes/Poly';
export declare class JsonExportDispatcher {
    static dispatch_node(node: BaseNodeType): PolyNodeJsonExporter | NodeJsonExporter<BaseNodeType>;
    static dispatch_param(param: BaseParamType): ParamJsonExporter<BaseParamType>;
}
