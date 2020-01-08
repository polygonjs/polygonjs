// import {BaseNode} from 'src/engine/nodes/_Base';
// import {BaseParam} from 'src/engine/params/_Base';

// export function Node<TBase extends Constructor>(Base: TBase) {
// 	return class Mixin extends Base {
// 		_node: BaseNode;
// 		protected self: BaseParam = (<unknown>this) as BaseParam;

// 		set_node(node: BaseNode) {
// 			if (!node) {
// 				if (this._node) {
// 					this._node.params_node().remove_graph_input(this);
// 				}
// 			} else {
// 				this._node = node;
// 				if (this.self.makes_node_dirty_when_dirty()) {
// 					node.params_node().add_graph_input(this);
// 				}
// 			}

// 			if (this.self.is_multiple()) {
// 				for (let c of this.self.components()) {
// 					c.set_node(node);
// 				}
// 			}
// 		}
// 		get node() {
// 			return this._node;
// 		}
// 		get parent() {
// 			return this.node;
// 		}
// 	};
// }
