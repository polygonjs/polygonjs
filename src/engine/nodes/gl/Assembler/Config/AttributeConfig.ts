import {BaseGlNodeType} from '../../_Base';
// import {Definition} from '../../Definition/_Module';
// import {DefinitionBaseConfig} from './DefinitionBaseConfig';
import {AttributeGLDefinition} from '../../utils/GLDefinition';
import {ConnectionPointType} from 'src/engine/nodes/utils/connections/ConnectionPointType';

export class AttributeConfig {
	constructor(protected _gl_type: ConnectionPointType, protected _name: string) {}
	create_definition(node: BaseGlNodeType) {
		return new AttributeGLDefinition(node, this._gl_type, this._name);
	}
}
