import { BaseGlParentNode } from '../Controller';
import { BaseGlNodeType } from '../../_Base';
export declare class GlNodeFinder {
    static find_output_nodes(node: BaseGlParentNode): import("../../Output").OutputGlNode[];
    static find_param_generating_nodes(node: BaseGlParentNode): BaseGlNodeType[];
    static find_attribute_export_nodes(node: BaseGlParentNode): import("../../Attribute").AttributeGlNode[];
}
