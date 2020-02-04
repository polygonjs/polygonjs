import {NodeCodeExporter} from '../Node'
import {CodeExporterVisitor} from '../Visitor'

export class BaseNodeSopSubnetworkCodeExporter extends NodeCodeExporter {

	add_custom() {
		if (this._node.children_allowed && this._node.children_allowed()){
			const display_node = this._node.display_node()
			if( display_node !== undefined ){
				const display_node_var_name = display_node.visit(CodeExporterVisitor).var_name()
				this._lines.push(`${this.var_name()}.set_display_node(${display_node_var_name})`)
			}
		}
	}


}

