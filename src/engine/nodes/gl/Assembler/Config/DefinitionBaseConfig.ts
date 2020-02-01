import {BaseNodeGl} from '../../_Base';

export abstract class DefinitionBaseConfig {
	constructor(protected _gl_type: string, protected _name: string) {}

	abstract create_definition(node: BaseNodeGl): void;
}
