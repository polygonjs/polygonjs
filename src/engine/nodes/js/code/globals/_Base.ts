import {GlobalsJsNode} from '../../Globals';
import {JsConnectionPointType} from '../../../utils/io/connections/Js';
import {BaseJsNodeType} from '../../_Base';
import {JsLinesCollectionController} from '../utils/JsLinesCollectionController';

export abstract class GlobalsJsBaseController {
	private static __next_id: number = 0;
	private _id: number;

	constructor() {
		this._id = GlobalsJsBaseController.__next_id++;
	}
	id() {
		return this._id;
	}

	handle_globals_node(
		globals_node: GlobalsJsNode,
		output_name: string,
		linesController: JsLinesCollectionController
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
		linesController: JsLinesCollectionController
	): void {}

	abstract readAttribute(
		node: BaseJsNodeType,
		gl_type: JsConnectionPointType,
		attrib_name: string,
		linesController: JsLinesCollectionController
	): string | undefined;
}
