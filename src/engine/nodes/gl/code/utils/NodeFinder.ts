import {BaseGlParentNode} from '../Controller';
import {BaseGlNodeType} from '../../_Base';
import {VaryingWriteGlNode} from '../../VaryingWrite';
import {AttributeGlNode} from '../../Attribute';

export class GlNodeFinder {
	static findOutputNodes(node: BaseGlParentNode) {
		const output_nodes = node.nodesByType('output');
		return output_nodes;
	}
	static findParamGeneratingNodes(node: BaseGlParentNode) {
		const list: BaseGlNodeType[] = [];
		node.childrenController?.traverseChildren((child) => {
			const childGlNode = child as BaseGlNodeType;
			if (childGlNode.paramsGenerating()) {
				list.push(childGlNode);
			}
		});

		return list;
	}
	static findVaryingNodes(node: BaseGlParentNode) {
		const nodes = node.nodesByType(VaryingWriteGlNode.type());
		return nodes;
	}
	static findAttributeExportNodes(node: BaseGlParentNode) {
		const nodes = node.nodesByType(AttributeGlNode.type());
		return nodes.filter((node) => {
			// do not use attributes that are used as an input, as export
			// return (node.used_output_names().length == 0) &&
			return node.isExporting();
		});
	}
}
