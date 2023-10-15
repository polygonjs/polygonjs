import {GlobalsGlNode} from '../../Globals';
import {GlConnectionPointType} from '../../../utils/io/connections/Gl';
import {BaseGlNodeType} from '../../_Base';
import {ShadersCollectionController} from '../utils/ShadersCollectionController';
import {GlobalsBaseControllerType} from './Common';

export abstract class GlobalsBaseController {
	// private static __nextId: number = 0;
	// private _id: number;

	// constructor() {
	// 	this._id = GlobalsBaseController.__nextId++;
	// }
	// id() {
	// 	return this._id;
	// }
	abstract type(): GlobalsBaseControllerType;

	handleGlobalsNode(
		globalsNode: GlobalsGlNode,
		outputName: string,
		shadersCollectionController: ShadersCollectionController
		// definitions_by_shader_name: Map<ShaderName, BaseGLDefinition[]>,
		// body_lines_by_shader_name: Map<ShaderName, string[]>,
		// body_lines: string[],
		// dependencies: ShaderName[],
		// shader_name: ShaderName
	): void {}

	handleGlobalVar(
		globalsNode: BaseGlNodeType,
		outputName: string,
		glType: GlConnectionPointType,
		shadersCollectionController: ShadersCollectionController
	): void {}

	abstract readAttribute(
		node: BaseGlNodeType,
		glType: GlConnectionPointType,
		attribName: string,
		shadersCollectionController: ShadersCollectionController
	): string | undefined;
}
