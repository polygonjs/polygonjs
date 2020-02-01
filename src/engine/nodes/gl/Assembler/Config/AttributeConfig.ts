import {BaseGlNodeType} from '../../_Base';
import {Definition} from '../../Definition/_Module';
import {DefinitionBaseConfig} from './DefinitionBaseConfig';

export class AttributeConfig extends DefinitionBaseConfig {
	create_definition(node: BaseGlNodeType) {
		return new Definition.Attribute(node, this._gl_type, this._name);
	}
}
