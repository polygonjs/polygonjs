import {GlType} from './../../../../poly/registers/nodes/types/Gl';
import {NodeContext} from './../../../../poly/NodeContext';
import {BaseGlParentNode} from '../Controller';
import {BaseGlNodeType} from '../../_Base';

export class GlNodeFinder {
	static findOutputNodes(node: BaseGlParentNode) {
		const output_nodes = node.nodesByType(GlType.OUTPUT);
		return output_nodes;
	}
	static findParamGeneratingNodes(node: BaseGlParentNode) {
		const list: BaseGlNodeType[] = [];
		node.childrenController?.traverseChildren(
			(child) => {
				const childGlNode = child as BaseGlNodeType;
				if (childGlNode.paramsGenerating()) {
					list.push(childGlNode);
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
	static findVaryingNodes(node: BaseGlParentNode) {
		const nodes = node.nodesByType(GlType.VARYING_WRITE);
		return nodes;
	}
	static findAttributeExportNodes(node: BaseGlParentNode) {
		const nodes = node.nodesByType(GlType.ATTRIBUTE);
		return nodes.filter((node) => {
			// do not use attributes that are used as an input, as export
			// return (node.used_output_names().length == 0) &&
			return node.isExporting();
		});
	}
}
