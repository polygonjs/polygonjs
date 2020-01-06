// import BaseNode from 'src/engine/nodes/_Base'
// import {BaseParam} from 'src/engine/params/_Base'
import {NodeSimple} from 'src/core/graph/NodeSimple'
import jsep from 'jsep'

export class JsepDependency {
	constructor(
		public node_simple: NodeSimple,
		public jsep_node: jsep.Expression
	) {}
}
