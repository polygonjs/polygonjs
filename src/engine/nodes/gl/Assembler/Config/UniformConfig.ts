import {BaseGlNodeType} from '../../_Base';
import {UniformGLDefinition} from '../../utils/GLDefinition';
import {ConnectionPointType} from 'src/engine/nodes/utils/connections/ConnectionPointType';
// import { Definition } from "../../Definition/_Module";
// import {DefinitionBaseConfig} from './DefinitionBaseConfig'

export class UniformConfig {
	constructor(protected _gl_type: ConnectionPointType, protected _name: string) {}

	create_definition(node: BaseGlNodeType) {
		return new UniformGLDefinition(node, this._gl_type, this._name);
	}
}
