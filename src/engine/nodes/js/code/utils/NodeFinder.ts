import {JsType} from './../../../../poly/registers/nodes/types/Js';
import {NodeContext} from './../../../../poly/NodeContext';
import {AssemblerControllerNode} from '../Controller';
import {BaseJsNodeType} from '../../_Base';
import {BaseJsShaderAssembler} from '../assemblers/_Base';

export class JsNodeFinder {
	static findOutputNodes(node: AssemblerControllerNode<BaseJsShaderAssembler>) {
		const output_nodes = node.nodesByType(JsType.OUTPUT);
		return output_nodes;
	}
	static findParamGeneratingNodes(node: AssemblerControllerNode<BaseJsShaderAssembler>) {
		const list: BaseJsNodeType[] = [];
		node.childrenController?.traverseChildren(
			(child) => {
				const childJsNode = child as BaseJsNodeType;
				if (childJsNode.paramsGenerating()) {
					list.push(childJsNode);
				}
			},
			(child) => {
				if (!child.childrenController) {
					return child.context() == NodeContext.GL;
				} else {
					return child.context() == NodeContext.GL && child.childrenController.context == NodeContext.GL;
				}
			}
		);

		return list;
	}
	// static findVaryingNodes(node: BaseJsParentNode) {
	// 	const nodes = node.nodesByType(JsType.VARYING_WRITE);
	// 	return nodes;
	// }
	static findAttributeExportNodes(node: AssemblerControllerNode<BaseJsShaderAssembler>) {
		const nodes = node.nodesByType(JsType.ATTRIBUTE);
		return nodes.filter((node) => {
			// do not use attributes that are used as an input, as export
			// return (node.used_output_names().length == 0) &&
			return node.isExporting();
		});
	}
}
