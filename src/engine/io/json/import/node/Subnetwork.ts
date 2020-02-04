import {NodeJsonImporter} from '../Node'

export class BaseNodeSopSubnetworkJsonImporter extends NodeJsonImporter {

	from_data_custom(data) {

		if (this._node.children_allowed && this._node.children_allowed()){
			const display_node_name = data['display_node_name']
			const display_node = this._node.node(display_node_name)
			if( display_node ){
				if(display_node.has_display_flag()){
					display_node.set_display_flag()
				}
			}
		}

	}


}

