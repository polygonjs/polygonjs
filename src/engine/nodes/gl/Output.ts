import {BaseNodeGl} from './_Base';
import {ParamType} from 'src/Engine/Param/_Module';
import {ThreeToGl} from 'src/Core/ThreeToGl';
// import {CodeBuilder} from './Util/CodeBuilder'
import {Definition} from './Definition/_Module';
import {ShaderName, LineType, LINE_TYPES} from './Assembler/Util/CodeBuilder';

export class Output extends BaseNodeGl {
	static type() {
		return 'output';
	}

	constructor() {
		super();
	}

	create_params() {
		this.material_node?.add_output_params(this);
		// this.add_param( ParamType.VECTOR, 'position', [0,0,0] )
		// this.add_param( ParamType.VECTOR, 'normal', [0,0,0] )
		// this.add_param( ParamType.COLOR, 'color', [1,1,1] )
		// this.add_param( ParamType.FLOAT, 'alpha', 1 )
		// this.add_param( ParamType.FLOAT, 'gl_PointSize', 1 )
		// this.add_param( ParamType.VECTOR, 'instancePosition', [0,0,0] )
	}

	set_lines() {
		this.assembler?.set_node_lines_output(this, this._shader_name);
	}

	// set_color_declaration(color_declaration: string){
	// 	this._color_declaration = color_declaration
	// }
}
