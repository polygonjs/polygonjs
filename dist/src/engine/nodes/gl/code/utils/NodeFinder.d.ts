import { BaseGlParentNode } from '../Controller';
import { BaseGlNodeType } from '../../_Base';
import { VaryingWriteGlNode } from '../../VaryingWrite';
import { AttributeGlNode } from '../../Attribute';
export declare class GlNodeFinder {
    static find_output_nodes(node: BaseGlParentNode): import("../../Output").OutputGlNode[];
    static find_param_generating_nodes(node: BaseGlParentNode): BaseGlNodeType[];
    static find_varying_nodes(node: BaseGlParentNode): VaryingWriteGlNode[];
    static find_attribute_export_nodes(node: BaseGlParentNode): AttributeGlNode[];
}
