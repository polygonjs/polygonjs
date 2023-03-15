import {GlobalsJsNode} from '../../Globals';
import {JsConnectionPointType} from '../../../utils/io/connections/Js';
import {BaseJsNodeType} from '../../_Base';
import {ShadersCollectionController} from '../utils/ShadersCollectionController';

export abstract class GlobalsBaseController {
	private static __next_id: number = 0;
	private _id: number;

	constructor() {
		this._id = GlobalsBaseController.__next_id++;
	}
	id() {
		return this._id;
	}

	handle_globals_node(
		globals_node: GlobalsJsNode,
		output_name: string,
		linesController: ShadersCollectionController
		// definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]>,
		// body_lines_by_shader_name: Map<ShaderName, string[]>,
		// body_lines: string[],
		// dependencies: ShaderName[],
		// shader_name: ShaderName
	): void {}

	handleGlobalVar(
		globals_node: BaseJsNodeType,
		output_name: string,
		glType: JsConnectionPointType,
		linesController: ShadersCollectionController
	): void {}

	abstract readAttribute(
		node: BaseJsNodeType,
		gl_type: JsConnectionPointType,
		attrib_name: string,
		linesController: ShadersCollectionController
	): string | undefined;
}
