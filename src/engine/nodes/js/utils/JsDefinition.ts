import {BaseJsNodeType} from '../_Base';
import {TypedJsDefinitionCollection} from './JsDefinitionCollection';
import {JsConnectionPointType} from '../../utils/io/connections/Js';
import {ShadersCollectionController} from '../code/utils/ShadersCollectionController';

export enum JsDefinitionType {
	// ATTRIBUTE = 'attribute',
	LOCAL_FUNCTION = 'localFunction',
	COMPUTED = 'computed',
	CONSTANT = 'constant',
	REF = 'ref',
	WATCH = 'watch',
}

export abstract class TypedJsDefinition<T extends JsDefinitionType> {
	constructor(
		protected _definitionType: T,
		protected _node: BaseJsNodeType,
		protected _shaderCollectionController: ShadersCollectionController,
		protected _dataType: JsConnectionPointType,
		protected _name: string
	) {
		// super(_node, _name);
	}

	definitionType() {
		return this._definitionType;
	}
	dataType() {
		return this._dataType;
	}
	node() {
		return this._node;
	}
	name() {
		return this._name;
	}

	abstract line(): string;
	collectionInstance() {
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

export class LocalFunctionJsDefinition extends TypedJsDefinition<JsDefinitionType.LOCAL_FUNCTION> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: ShadersCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _functionDefinition: string
	) {
		super(JsDefinitionType.LOCAL_FUNCTION, _node, _shaderCollectionController, _dataType, _name);
	}
	line() {
		return this._functionDefinition;
	}
	// functionDefinition() {
	// 	return this._functionDefinition;
	// }
}

// export class UniformJsDefinition extends TypedJsDefinition<JsDefinitionType.UNIFORM> {
// 	constructor(
// 		protected override _node: BaseJsNodeType,
// 		protected override _data_type: JsConnectionPointType,
// 		protected override _name: string
// 	) {
// 		super(JsDefinitionType.UNIFORM, _data_type, _node, _name);
// 	}
// 	get line() {
// 		return `uniform ${this.data_type} ${this.name()}`;
// 	}
// }

// export class InitJsDefinition extends TypedJsDefinition<JsDefinitionType.INIT> {
// 	constructor(
// 		protected override _node: BaseJsNodeType,
// 		protected override _shaderCollectionController: ShadersCollectionController,
// 		protected override _dataType: JsConnectionPointType,
// 		protected override _name: string,
// 		protected _value: string
// 	) {
// 		super(JsDefinitionType.INIT, _node, _shaderCollectionController, _dataType, _name);
// 		_shaderCollectionController.addComputedVarName(this.name());
// 	}
// 	line() {
// 		return `	this.${this.name()} = computed(()=> ${this._value} )`;
// 	}
// }

export class ComputedValueJsDefinition extends TypedJsDefinition<JsDefinitionType.COMPUTED> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: ShadersCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _value: string
	) {
		super(JsDefinitionType.COMPUTED, _node, _shaderCollectionController, _dataType, _name);
		_shaderCollectionController.addComputedVarName(this.name());
	}
	line() {
		return `	${this.name()} = computed(()=> ${this._value} )`;
	}
}
export class ConstantJsDefinition extends TypedJsDefinition<JsDefinitionType.CONSTANT> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: ShadersCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _value: string
	) {
		super(JsDefinitionType.CONSTANT, _node, _shaderCollectionController, _dataType, _name);
		_shaderCollectionController.addComputedVarName(this.name());
	}
	line() {
		return `	${this.name()} = {value:${this._value}}`;
	}
}
export class RefJsDefinition extends TypedJsDefinition<JsDefinitionType.REF> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: ShadersCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _value: string
	) {
		super(JsDefinitionType.REF, _node, _shaderCollectionController, _dataType, _name);
		_shaderCollectionController.addComputedVarName(this.name());
	}
	line() {
		return `	${this.name()} = ref(${this._value})`;
	}
}
export class WatchedValueJsDefinition extends TypedJsDefinition<JsDefinitionType.WATCH> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: ShadersCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _value: string
	) {
		super(JsDefinitionType.WATCH, _node, _shaderCollectionController, _dataType, _name);
		_shaderCollectionController.addComputedVarName(this.name());
	}
	line() {
		return `	watch(this.${this.name()}.value, ()=> {${this._value}})`;
	}
}

export type BaseJsDefinition = TypedJsDefinition<JsDefinitionType>;
