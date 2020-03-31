import { AssemblerControllerNode } from '../Controller';
export declare class GlNodeFinder {
    static find_output_nodes(node: AssemblerControllerNode): import("../../Output").OutputGlNode[];
    static find_attribute_export_nodes(node: AssemblerControllerNode): import("../../Attribute").AttributeGlNode[];
}
