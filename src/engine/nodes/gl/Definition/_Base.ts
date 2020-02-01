import {BaseGlNodeType} from '../_Base';

export abstract class BaseDefinition {
	constructor(protected _node: BaseGlNodeType, protected _name: string) {}

	node() {
		return this._node;
	}
	name() {
		return this._name;
	}
	id() {
		return this.name();
	}

	abstract line();
	abstract collection_constructor();
}
