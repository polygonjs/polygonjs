import {BaseGlParentNode} from '../Controller';
import {BaseGlNodeType} from '../../_Base';
import {VaryingWriteGlNode} from '../../VaryingWrite';
import {AttributeGlNode} from '../../Attribute';

export class GlNodeFinder {
	static find_output_nodes(node: BaseGlParentNode) {
		const output_nodes = node.nodesByType('output');
		return output_nodes;
	}
	static find_param_generating_nodes(node: BaseGlParentNode) {
		const list: BaseGlNodeType[] = [];
		node.childrenController?.traverse_children((child) => {
			const childGlNode = child as BaseGlNodeType;
			if (childGlNode.paramsGenerating()) {
				list.push(childGlNode);
			}
		});

		return list;
	}
	static find_varying_nodes(node: BaseGlParentNode) {
		const nodes = node.nodesByType(VaryingWriteGlNode.type());
		return nodes;
	}
	static find_attribute_export_nodes(node: BaseGlParentNode) {
		const nodes = node.nodesByType(AttributeGlNode.type());
		return nodes.filter((node) => {
			// do not use attributes that are used as an input, as export
			// return (node.used_output_names().length == 0) &&
			return node.is_exporting;
		});
	}
}
