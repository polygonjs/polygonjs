import {BaseJsNodeType} from '../_Base';
import {TypedJsDefinitionCollection} from './JsDefinitionCollection';
import {JsConnectionPointType} from '../../utils/io/connections/Js';

export enum JsDefinitionType {
	ATTRIBUTE = 'attribute',
	FUNCTION = 'function',
	UNIFORM = 'uniform',
}

export abstract class TypedJsDefinition<T extends JsDefinitionType> {
	constructor(
		protected _definition_type: T,
		protected _data_type: JsConnectionPointType,
		protected _node: BaseJsNodeType,
		protected _name: string
	) {
		// super(_node, _name);
	}

	get definition_type() {
		return this._definition_type;
	}
	get data_type() {
		return this._data_type;
	}
	get node() {
		return this._node;
	}
	name() {
		return this._name;
	}

	abstract get line(): string;
	collection_instance() {
		return new TypedJsDefinitionCollection<T>();
	}
}

// export class AttributeGLDefinition extends TypedJsDefinition<JsDefinitionType.ATTRIBUTE> {
// 	constructor(
// 		protected override _node: BaseJsNodeType,
// 		protected override _data_type: JsConnectionPointType,
// 		protected override _name: string
// 	) {
// 		super(JsDefinitionType.ATTRIBUTE, _data_type, _node, _name);
// 	}
// 	get line() {
// 		return `attribute ${this.data_type} ${this.name()}`;
// 	}
// }

export class FunctionJsDefinition extends TypedJsDefinition<JsDefinitionType.FUNCTION> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _name: string,
		private _function: Function
	) {
		super(JsDefinitionType.FUNCTION, JsConnectionPointType.FLOAT, _node, _name);
	}
	get line() {
		return this.name();
	}
	registeredFunction() {
		return this._function;
	}
}

export class UniformJsDefinition extends TypedJsDefinition<JsDefinitionType.UNIFORM> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _data_type: JsConnectionPointType,
		protected override _name: string
	) {
		super(JsDefinitionType.UNIFORM, _data_type, _node, _name);
	}
	get line() {
		return `uniform ${this.data_type} ${this.name()}`;
	}
}

export type BaseJsDefinition = TypedJsDefinition<JsDefinitionType>;
