// import {CoreString} from 'src/core/String';
// import {NodeSimple} from 'src/core/Graph/NodeSimple';

import {BaseNode} from '../_Base';
// import lodash_isNaN from 'lodash/isNaN';

export function Named<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		protected self: BaseNode = (<unknown>this) as BaseNode;

		// base_name(): string {
		// 	// TODO: make static
		// 	let base = this.self.type(); //CoreString.class_name_to_type(this.self.type())
		// 	const last_char = base[base.length - 1];
		// 	if (!lodash_isNaN(parseInt(last_char))) {
		// 		base += '_';
		// 	}
		// 	return `${base}1`;
		// }

		request_name_to_parent(new_name: string) {
			const parent = this.self.parent();
			if (parent != null) {
				parent.set_child_name(this.self, new_name);
			} else {
				console.warn('request_name_to_parent failed, no parent found');
			}
		}
		set_name(new_name: string) {
			if (new_name == this.self._name) {
				return;
			}
			this.request_name_to_parent(new_name);
		}
		_set_name(new_name: string) {
			this.self._name = new_name;
			this.post_set_name();
			this.post_set_full_path();
			this.self.children().forEach((node) => node.post_set_full_path());
			this.self.name_graph_node().set_dirty();
			this.self.name_graph_node().remove_dirty_state();
			this.self.emit('node_name_update');
		}

		post_set_name() {}
		post_set_full_path() {}
	};
}
