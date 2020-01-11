// import BaseNode from 'src/engine/nodes/_Base'
// import {BaseParam} from 'src/engine/params/_Base'
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';
import jsep from 'jsep';

export class JsepDependency {
	constructor(public node_simple: CoreGraphNode, public jsep_node: jsep.Expression) {}
}
