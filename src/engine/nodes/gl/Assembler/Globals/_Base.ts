import {ShaderName} from 'src/engine/nodes/utils/shaders/ShaderName';
import {BaseGLDefinition} from '../../utils/GLDefinition';
import {GlobalsGlNode} from '../../Globals';
import {ConnectionPointType} from 'src/engine/nodes/utils/connections/ConnectionPointType';
import {BaseGlNodeType} from '../../_Base';

export class GlobalsBaseController {
	private static __next_id: number = 0;
	private _id: number;

	constructor() {
		this._id = GlobalsBaseController.__next_id++;
	}
	id() {
		return this._id;
	}

	handle_globals_node(
		globals_node: GlobalsGlNode,
		output_name: string,
		definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]>,
		body_lines_by_shader_name: Map<ShaderName, string[]>,
		body_lines: string[],
		dependencies: ShaderName[],
		shader_name: ShaderName
	): void {}

	read_attribute(
		node: BaseGlNodeType,
		gl_type: ConnectionPointType,
		attrib_name: string,
		shader_name: ShaderName
	): void {}
}
