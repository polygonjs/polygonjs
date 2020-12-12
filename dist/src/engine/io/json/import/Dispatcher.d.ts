import { BaseNodeType } from '../../../nodes/_Base';
import { BaseParamType } from '../../../params/_Base';
import { NodeJsonImporter } from './Node';
import { ParamJsonImporter } from './Param';
import { ParamMultipleJsonImporter } from './param/Multiple';
import { PolyNodeJsonImporter } from './nodes/Poly';
export declare class JsonImportDispatcher {
    static dispatch_node(node: BaseNodeType): PolyNodeJsonImporter | NodeJsonImporter<BaseNodeType>;
    static dispatch_param(param: BaseParamType): ParamMultipleJsonImporter | ParamJsonImporter<BaseParamType>;
}
