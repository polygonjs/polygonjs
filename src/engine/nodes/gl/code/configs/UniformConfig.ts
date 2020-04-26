import {BaseGlNodeType} from '../../_Base';
import {UniformGLDefinition} from '../../utils/GLDefinition';
import {GlConnectionPointType} from '../../../utils/io/connections/Gl';
// import { Definition } from "../../Definition/_Module";
// import {DefinitionBaseConfig} from './DefinitionBaseConfig'

export class UniformConfig {
	constructor(protected _gl_type: GlConnectionPointType, protected _name: string) {}

	create_definition(node: BaseGlNodeType) {
		return new UniformGLDefinition(node, this._gl_type, this._name);
	}
}
