import {BaseGlNodeType} from '../_Base';
import {TypedGLDefinitionCollection} from './GLDefinitionCollection';
import {GlConnectionPointType} from '../../utils/io/connections/Gl';

export enum GLDefinitionType {
	ATTRIBUTE = 'attribute',
	FUNCTION = 'function',
	UNIFORM = 'uniform',
	VARYING = 'varying',
}

export abstract class TypedGLDefinition<T extends GLDefinitionType> {
	// constructor(protected _node: BaseGlNodeType, protected _name: string) {}
	constructor(
		protected _definition_type: T,
		protected _data_type: GlConnectionPointType,
		protected _node: BaseGlNodeType,
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
	// get id() {
	// 	return this._data_type;
	// }

	abstract get line(): string;
	collection_instance() {
		return new TypedGLDefinitionCollection<T>();
	}
}

export class AttributeGLDefinition extends TypedGLDefinition<GLDefinitionType.ATTRIBUTE> {
	constructor(protected _node: BaseGlNodeType, protected _data_type: GlConnectionPointType, protected _name: string) {
		super(GLDefinitionType.ATTRIBUTE, _data_type, _node, _name);
	}
	get line() {
		return `attribute ${this.data_type} ${this.name()}`;
	}
}

export class FunctionGLDefinition extends TypedGLDefinition<GLDefinitionType.FUNCTION> {
	constructor(protected _node: BaseGlNodeType, protected _name: string) {
		super(GLDefinitionType.FUNCTION, GlConnectionPointType.FLOAT, _node, _name);
	}
	get line() {
		return this.name();
	}
}

export class UniformGLDefinition extends TypedGLDefinition<GLDefinitionType.UNIFORM> {
	constructor(protected _node: BaseGlNodeType, protected _data_type: GlConnectionPointType, protected _name: string) {
		super(GLDefinitionType.UNIFORM, _data_type, _node, _name);
	}
	get line() {
		return `uniform ${this.data_type} ${this.name()}`;
	}
}

export class VaryingGLDefinition extends TypedGLDefinition<GLDefinitionType.VARYING> {
	constructor(protected _node: BaseGlNodeType, protected _data_type: GlConnectionPointType, protected _name: string) {
		super(GLDefinitionType.VARYING, _data_type, _node, _name);
	}
	get line() {
		return `varying ${this.data_type} ${this.name()}`;
	}
}
export type BaseGLDefinition = TypedGLDefinition<GLDefinitionType>;
