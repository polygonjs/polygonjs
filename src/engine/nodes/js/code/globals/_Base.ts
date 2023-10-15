import {GlobalsJsNode} from '../../Globals';
import {JsConnectionPointType} from '../../../utils/io/connections/Js';
import {BaseJsNodeType} from '../../_Base';
import {JsLinesCollectionController} from '../utils/JsLinesCollectionController';
import {GlobalsJsBaseControllerType} from './Common';

export abstract class GlobalsJsBaseController {
	// private static __nextId: number = 0;
	// private _id: number;

	// constructor() {
	// 	this._id = GlobalsJsBaseController.__nextId++;
	// }
	// id() {
	// 	return this._id;
	// }
	abstract type(): GlobalsJsBaseControllerType;

	handleGlobalsNode(
		globalsNode: GlobalsJsNode,
		outputName: string,
		linesController: JsLinesCollectionController
		// definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]>,
		// body_lines_by_shader_name: Map<ShaderName, string[]>,
		// body_lines: string[],
		// dependencies: ShaderName[],
		// shader_name: ShaderName
	): void {}

	handleGlobalVar(
		globalsNode: BaseJsNodeType,
		outputName: string,
		glType: JsConnectionPointType,
		linesController: JsLinesCollectionController
	): void {}

	abstract readAttribute(
		node: BaseJsNodeType,
		jsType: JsConnectionPointType,
		attribName: string,
		linesController: JsLinesCollectionController
	): string | undefined;
}
