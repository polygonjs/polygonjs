import {BaseJsNodeType} from '../_Base';
import {TypedJsDefinitionCollection} from './JsDefinitionCollection';
import {JsConnectionPointType} from '../../utils/io/connections/Js';
import {JsLinesCollectionController} from '../code/utils/JsLinesCollectionController';
import {nodeMethodName} from '../code/assemblers/actor/ActorAssemblerUtils';
import {LineType} from '../code/utils/LineType';
import {MapUtils} from '../../../../core/MapUtils';
import {EvaluatorMethodName} from '../code/assemblers/actor/ActorEvaluator';
import {ArrayUtils} from '../../../../core/ArrayUtils';
import {ActorAssemblerConstant} from '../code/assemblers/actor/ActorAssemblerCommon';
import {Poly} from '../../../Poly';
import {inputObject3D} from '../_BaseObject3D';

export enum JsDefinitionType {
	// ATTRIBUTE = 'attribute',
	LOCAL_FUNCTION = 'localFunction',
	COMPUTED = 'computed',
	CONSTANT = 'constant',
	REF = 'ref',
	WATCH = 'watch',
	INIT_FUNCTION = 'initFunction',
	TRIGGERING = 'triggering',
	TRIGGERABLE = 'triggerable',
}

export abstract class TypedJsDefinition<T extends JsDefinitionType> {
	constructor(
		protected _definitionType: T,
		protected _node: BaseJsNodeType,
		protected _shaderCollectionController: JsLinesCollectionController,
		protected _dataType: JsConnectionPointType,
		protected _name: string
	) {
		// super(_node, _name);
	}
	static gather(definitions: BaseJsDefinition[], linesForShader: Map<LineType, string[]>, lineType: LineType) {}

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
		protected override _shaderCollectionController: JsLinesCollectionController,
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
		protected override _shaderCollectionController: JsLinesCollectionController,
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
		protected override _shaderCollectionController: JsLinesCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _value: string
	) {
		super(JsDefinitionType.CONSTANT, _node, _shaderCollectionController, _dataType, _name);
		if (this._shaderCollectionController.assembler().computedVariablesAllowed()) {
			_shaderCollectionController.addComputedVarName(this.name());
		}
	}
	line() {
		if (this._shaderCollectionController.assembler().computedVariablesAllowed()) {
			return `	${this.name()} = {value:${this._value}}`;
		} else {
			return `	${this.name()} = ${this._value}`;
		}
	}
}
export class RefJsDefinition extends TypedJsDefinition<JsDefinitionType.REF> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: JsLinesCollectionController,
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
interface WatchedValueJsDefinitionOptions {
	// onChange: (prevVal: string) => string;
	deep?: boolean;
}
export class WatchedValueJsDefinition extends TypedJsDefinition<JsDefinitionType.WATCH> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: JsLinesCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _value: string,
		protected _options: WatchedValueJsDefinitionOptions
	) {
		super(JsDefinitionType.WATCH, _node, _shaderCollectionController, _dataType, _name);
		_shaderCollectionController.addComputedVarName(this.name());
	}
	line() {
		const deep = this._options.deep != null ? this._options.deep : false;
		return `
		this._watchStopHandles.push(
			watch(
				${this.name()},
				( )=> {
					${this._value}
				},
				{
					deep: ${deep}
				}
			)
		)`;
	}
}
export class InitFunctionJsDefinition extends TypedJsDefinition<JsDefinitionType.INIT_FUNCTION> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: JsLinesCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _value: string
	) {
		super(JsDefinitionType.INIT_FUNCTION, _node, _shaderCollectionController, _dataType, _name);
		// _shaderCollectionController.addComputedVarName(this.name());
	}
	line() {
		return `	${this._value}`;
	}
}
interface TriggeringJsDefinitionOptions {
	triggeringMethodName: EvaluatorMethodName;
	gatherable: boolean;
	nodeMethodName?: string;
	perPoint?: boolean;
}
export class TriggeringJsDefinition extends TypedJsDefinition<JsDefinitionType.TRIGGERING> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: JsLinesCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _value: string,
		protected _options: TriggeringJsDefinitionOptions
	) {
		super(JsDefinitionType.TRIGGERING, _node, _shaderCollectionController, _dataType, _name);
		// _shaderCollectionController.addComputedVarName(this.name());
	}
	line() {
		const methodName = this._options.nodeMethodName || nodeMethodName(this._node);
		if (this._options.perPoint) {
			const func = Poly.namedFunctionsRegister.getFunction(
				'setPointIndex',
				this._node,
				this._shaderCollectionController
			);
			const setPointIndex = func.asString(inputObject3D(this._node, this._shaderCollectionController), 'i');

			return `${methodName}(){
				const pointsCount = CoreGeometry.pointsCount(${ActorAssemblerConstant.GEOMETRY});
				for(let i=0; i<pointsCount; i++){
					${setPointIndex}
					${this._value}
				}
			}`;
		} else {
			return `${methodName}(){
				${this._value}
			}`;
		}
	}
	static override gather(
		_definitions: TypedJsDefinition<JsDefinitionType>[],
		linesForShader: Map<LineType, string[]>,
		lineType: LineType
	) {
		const triggeringDefinitions = (
			_definitions.filter((d) => d.definitionType() == JsDefinitionType.TRIGGERING) as TriggeringJsDefinition[]
		).filter((d) => d._options.gatherable == true);
		const definitionGroups = MapUtils.groupBy(
			triggeringDefinitions,
			(definition) => definition._options.triggeringMethodName
		);
		definitionGroups.forEach((definitions, triggeringMethodName) => {
			const definitionMethodCalls = ArrayUtils.uniq(
				definitions.map((d) => `this.${nodeMethodName(d.node())}()`)
			).join(';');
			const line = `${triggeringMethodName}(){
				${definitionMethodCalls}
			}`;

			MapUtils.pushOnArrayAtEntry(linesForShader, lineType, line);
		});
	}
}
export interface TriggerableJsDefinitionOptions {
	async?: boolean;
	methodName?: string;
}
export class TriggerableJsDefinition extends TypedJsDefinition<JsDefinitionType.TRIGGERABLE> {
	constructor(
		protected override _node: BaseJsNodeType,
		protected override _shaderCollectionController: JsLinesCollectionController,
		protected override _dataType: JsConnectionPointType,
		protected override _name: string,
		protected _value: string,
		protected _options?: TriggerableJsDefinitionOptions
	) {
		super(JsDefinitionType.TRIGGERABLE, _node, _shaderCollectionController, _dataType, _name);
		// _shaderCollectionController.addComputedVarName(this.name());
	}
	line() {
		const _async = this._options?.async == true;
		const functionPrefix = _async ? 'async' : '';
		const methodName = this._options?.methodName != null ? this._options?.methodName : nodeMethodName(this._node);
		return `${functionPrefix} ${methodName}(){
			${this._value}
		}`;
	}
}

// type DefinitionTypeMapGeneric = {[key in JsDefinitionType]: any};

export interface DefinitionTypeMap {
	[JsDefinitionType.LOCAL_FUNCTION]: typeof LocalFunctionJsDefinition;
	[JsDefinitionType.COMPUTED]: typeof ComputedValueJsDefinition;
	[JsDefinitionType.CONSTANT]: typeof ConstantJsDefinition;
	[JsDefinitionType.REF]: typeof RefJsDefinition;
	[JsDefinitionType.WATCH]: typeof WatchedValueJsDefinition;
	[JsDefinitionType.INIT_FUNCTION]: typeof InitFunctionJsDefinition;
	[JsDefinitionType.TRIGGERING]: typeof TriggeringJsDefinition;
	[JsDefinitionType.TRIGGERABLE]: typeof TriggerableJsDefinition;
}
export const JsDefinitionTypeMap: DefinitionTypeMap = {
	[JsDefinitionType.LOCAL_FUNCTION]: LocalFunctionJsDefinition,
	[JsDefinitionType.COMPUTED]: ComputedValueJsDefinition,
	[JsDefinitionType.CONSTANT]: ConstantJsDefinition,
	[JsDefinitionType.REF]: RefJsDefinition,
	[JsDefinitionType.WATCH]: WatchedValueJsDefinition,
	[JsDefinitionType.INIT_FUNCTION]: InitFunctionJsDefinition,
	[JsDefinitionType.TRIGGERING]: TriggeringJsDefinition,
	[JsDefinitionType.TRIGGERABLE]: TriggerableJsDefinition,
};

export type BaseJsDefinition = TypedJsDefinition<JsDefinitionType>;
