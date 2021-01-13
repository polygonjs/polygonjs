// import BaseNode from 'src/engine/nodes/_Base'
import {BaseParamType} from '../params/_Base';
// import {BaseNode} from '../nodes/_Base'
import {CoreGraphNode} from '../../core/graph/CoreGraphNode';
import jsep from 'jsep';

// type NodeOrParam = BaseNode | BaseParam

export class NamesListener extends CoreGraphNode {
	// private nodes_in_path: NodeOrParam[] = []

	constructor(public param: BaseParamType, public node_simple: CoreGraphNode, public jsep_node: jsep.Expression) {
		super(param.scene(), 'NamesListener');

		// this.set_scene(this.param.scene);
		this.connect_to_nodes_in_path();
	}

	reset() {
		// remove connections
	}

	connect_to_nodes_in_path() {
		this.find_nodes_in_path();
	}

	find_nodes_in_path() {
		console.log('find nodes in path');
	}
}
