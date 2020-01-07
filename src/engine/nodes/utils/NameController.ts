import {BaseNode} from 'src/engine/nodes/_Base';
import lodash_isNaN from 'lodash/isNaN';
export class NameController {
	// constructor(public node: BaseNode) {}

	static base_name(node: BaseNode) {
		let base = node.type(); //CoreString.class_name_to_type(this.self.type())
		const last_char = base[base.length - 1];
		if (!lodash_isNaN(parseInt(last_char))) {
			base += '_';
		}
		return `${base}1`;
	}
}
