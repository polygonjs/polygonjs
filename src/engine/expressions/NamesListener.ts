// import BaseNode from 'src/engine/nodes/_Base'
import {BaseParam} from 'src/engine/params/_Base'
// import {BaseNode} from 'src/engine/nodes/_Base'
import {NodeSimple} from 'src/core/graph/NodeSimple'
import jsep from 'jsep'

// type NodeOrParam = BaseNode | BaseParam

export class NamesListener extends NodeSimple {
	// private nodes_in_path: NodeOrParam[] = []

	constructor(
		public param: BaseParam,
		public node_simple: NodeSimple,
		public jsep_node: jsep.Expression
	) {
		super()

		this.set_scene(this.param.scene())
		this.connect_to_nodes_in_path()
	}

	reset() {
		// remove connections
	}

	connect_to_nodes_in_path() {
		this.find_nodes_in_path()
	}

	find_nodes_in_path() {
		console.log('find nodes in path')
	}
}
