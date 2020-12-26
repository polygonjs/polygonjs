import {BaseGlParentNode} from '../Controller';
import {BaseGlNodeType} from '../../_Base';
import {VaryingWriteGlNode} from '../../VaryingWrite';
import {ParamGlNode} from '../../Param';
import {TextureGlNode} from '../../Texture';
import {RampGlNode} from '../../Ramp';
import {AttributeGlNode} from '../../Attribute';
import {IfThenGlNode} from '../../IfThen';

export class GlNodeFinder {
	static find_output_nodes(node: BaseGlParentNode) {
		const output_nodes = node.nodesByType('output');
		return output_nodes;
	}
	static find_param_generating_nodes(node: BaseGlParentNode) {
		const param_nodes: BaseGlNodeType[] = node.nodesByType(ParamGlNode.type());
		const texture_nodes = node.nodesByType(TextureGlNode.type());
		const ramp_nodes = node.nodesByType(RampGlNode.type());
		let all = param_nodes.concat(texture_nodes).concat(ramp_nodes);

		const if_then_nodes: BaseGlParentNode[] = node.nodesByType(IfThenGlNode.type());
		for (let if_then_node of if_then_nodes) {
			all = all.concat(this.find_param_generating_nodes(if_then_node));
		}

		return all;
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
