// import {CoreString} from 'src/Core/String';
import {NodeSimple} from './NodeSimple'
import {NameGraphNode} from './NameGraphNode'
// import {CoreObject} from '../Object'
// import Node from '../_Base'

export function NamedGraphNode<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		self: NodeSimple = (<unknown>this) as NodeSimple
		_name: string
		_name_graph_node: NameGraphNode

		name() {
			return this._name
		}

		name_graph_node(): NameGraphNode {
			return (this._name_graph_node =
				this._name_graph_node || this._create_name_graph_node())
		}
		protected _create_name_graph_node(): NameGraphNode {
			const node = new NameGraphNode(this)
			node.set_scene(this.self.scene())
			return node
		}
	}
}
class DummyClass {}
export class NamedGraphNodeClass extends NamedGraphNode(DummyClass) {
	// constructor(private _owner: NamedGraphNodeClass) {
	// 	super()
	// }
}
