import {BaseGlNodeType} from '../../_Base';
// import {Definition} from '../../Definition/_Module';
// import {DefinitionBaseConfig} from './DefinitionBaseConfig';
import {AttributeGLDefinition} from '../../utils/GLDefinition';
import {GlConnectionPointType} from '../../../utils/io/connections/Gl';

export class AttributeConfig {
	constructor(protected _gl_type: GlConnectionPointType, protected _name: string) {}
	create_definition(node: BaseGlNodeType) {
		return new AttributeGLDefinition(node, this._gl_type, this._name);
	}
}
