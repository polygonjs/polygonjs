import {BaseNode} from 'src/Engine/Node/_Base'
// import {NodeCodeExporter} from './Node'
import {CodeExporterVisitor} from './Visitor'

export class NodesCodeExporter {
	_lines: string[] = []
	constructor(private _nodes: BaseNode[]){}

	process(parent_var_name?: string, position_x_offset?: number){
		this._lines = []

		this.add_process( parent_var_name, position_x_offset )

		return this._lines
	}

	process_with_existing_nodes(parent: BaseNode, parent_var_name: string, position_x_offset?: number){
		this._lines = []

		this.add_existing_nodes( parent, parent_var_name )
		this.add_process( parent_var_name, position_x_offset )

		return this._lines
	}

	private add_process(parent_var_name?: string, position_x_offset?: number){
		this.multi_push( this.create_function_declare(parent_var_name) )
		this.multi_push( this.create_function_call(parent_var_name) )

		this._nodes.forEach(node => {
			this.multi_push( node.visit(CodeExporterVisitor).set_up({position_x_offset: position_x_offset}) )
		})

	}

	private add_existing_nodes(parent: BaseNode, parent_var_name: string){
		parent.children().forEach(child=>{
			const child_var_name = child.visit(CodeExporterVisitor).var_name()
			const line = `var ${child_var_name} = ${parent_var_name}.node('${child.name()}')`
			this._lines.push(line)
		})
	}

	create_function_declare(parent_var_name) : string[] {
		const lines: string[] = []
		this._nodes.forEach(node => {
			const child_lines = node.visit(CodeExporterVisitor).create_function_declare(parent_var_name)
			child_lines.forEach(child_line=>{
				lines.push(child_line)
			})
		})
		return lines
	}
	create_function_call(parent_var_name) : string[] {
		const lines: string[] = []
		this._nodes.forEach(node => {
			const child_line = node.visit(CodeExporterVisitor).create_function_call(parent_var_name)
			lines.push(child_line)
		})
		return lines
	}


	private multi_push(child_lines: string[]){
		child_lines.forEach(child_line=>{
			this._lines.push( child_line )
		})
	}


}

