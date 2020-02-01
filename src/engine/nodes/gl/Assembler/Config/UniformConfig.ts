import { BaseNodeGl } from "../../_Base";
import { Definition } from "../../Definition/_Module";
import {DefinitionBaseConfig} from './DefinitionBaseConfig'

export class UniformConfig extends DefinitionBaseConfig {


	create_definition(node: BaseNodeGl){
		return new Definition.Uniform(node, this._gl_type, this._name)
	}

}