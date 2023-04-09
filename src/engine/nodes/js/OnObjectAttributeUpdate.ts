/**
 * sends a trigger when an object attribute has been updated
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	JsConnectionPoint,
	JsConnectionPointType,
	JS_CONNECTION_POINT_IN_NODE_DEF,
	ParamConvertibleJsType,
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
	// ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {WatchedValueJsDefinition, RefJsDefinition} from './utils/JsDefinition';
import {Poly} from '../../Poly';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';
import {createVariable} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {StringParam} from '../../params/String';
// import {CoreObject} from '../../../core/geometry/Object';
enum OnObjectAttributeUpdateInputName {
	attribName = 'attribName',
}

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OnObjectAttributeUpdateJsParamsConfig extends NodeParamsConfig {
	// attribName = ParamConfig.STRING('');
	type = ParamConfig.INTEGER(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(JsConnectionPointType.FLOAT), {
		menu: {
			entries: PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.map((name, i) => {
				return {name: name, value: i};
			}),
		},
	});
}
const ParamsConfig = new OnObjectAttributeUpdateJsParamsConfig();

export class OnObjectAttributeUpdateJsNode extends TypedJsNode<OnObjectAttributeUpdateJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_OBJECT_ATTRIBUTE_UPDATE;
	}
	override isTriggering() {
		return true;
	}

	static readonly OUTPUT_NEW_VAL = 'newValue';
	static readonly OUTPUT_PREV_VAL = 'previousValue';
	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['type']);
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				OnObjectAttributeUpdateInputName.attribName,
				JsConnectionPointType.STRING,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);

		// this.io.connection_points.set_expected_input_types_function(() => []);
		this.io.connection_points.set_output_name_function(
			(index: number) =>
				[
					TRIGGER_CONNECTION_NAME,
					OnObjectAttributeUpdateJsNode.OUTPUT_NEW_VAL,
					OnObjectAttributeUpdateJsNode.OUTPUT_PREV_VAL,
				][index]
		);
		this.io.connection_points.set_expected_output_types_function(() => [
			JsConnectionPointType.TRIGGER,
			...this._currentConnectionType(),
		]);
	}
	private _currentConnectionType() {
		if (this.pv.type == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		const connectionType = PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
		if (connectionType == null) {
			console.warn(`${this.type()} actor node type not valid`);
		}
		return [connectionType, connectionType];
	}

	setAttribType(type: ParamConvertibleJsType) {
		this.p.type.set(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	attribType(): JsConnectionPointType {
		return PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES[this.pv.type];
	}
	attributeName() {
		return (this.params.get(OnObjectAttributeUpdateInputName.attribName) as StringParam).value;
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const type = this.attribType();
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.variableForInput(
			shadersCollectionController,
			OnObjectAttributeUpdateInputName.attribName
		);

		const out = this.jsVarName('out');
		const prevValueRef = this.jsVarName('previousValueRef');
		const getObjectAttributeRef = Poly.namedFunctionsRegister.getFunction(
			'getObjectAttributeRef',
			this,
			shadersCollectionController
		);
		// const setObjectAttributeRef = Poly.namedFunctionsRegister.getFunction(
		// 	'setObjectAttributeRef',
		// 	this,
		// 	shadersCollectionController
		// );

		shadersCollectionController.addDefinitions(this, [
			// new ComputedValueJsDefinition(
			// 	this,
			// 	shadersCollectionController,
			// 	type,
			// 	out,
			// 	getObjectAttributeRef.asString(object3D, attribName)
			// ),
			new WatchedValueJsDefinition(
				this,
				shadersCollectionController,
				type,
				getObjectAttributeRef.asString(object3D, attribName, `'${type}'`),
				`this.${nodeMethodName(this)}()`,
				{
					deep: true,
				}
			),
			new RefJsDefinition(this, shadersCollectionController, type, prevValueRef, `false`),
		]);

		// outputs
		const usedOutputNames = this.io.outputs.used_output_names();
		const _val = (
			propertyName: string,
			functionName: 'getObjectAttribute' | 'getObjectAttributePrevious',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			const varName = this.jsVarName(propertyName);
			const variable = createVariable(type);
			if (variable) {
				shadersCollectionController.addVariable(this, out, variable);
			}
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, attribName, `'${type}'`),
				},
			]);
		};
		// const _prevVal = (propertyName: string, type: JsConnectionPointType) => {
		// 	if (!usedOutputNames.includes(propertyName)) {
		// 		return;
		// 	}
		// 	const varName = this.jsVarName(propertyName);
		// 	shadersCollectionController.addBodyOrComputed(this, [
		// 		{
		// 			dataType: type,
		// 			varName,
		// 			value: `this.${prevValueRef}.value`,
		// 		},
		// 	]);
		// };

		_val(OnObjectAttributeUpdateJsNode.OUTPUT_NEW_VAL, 'getObjectAttribute', type);
		_val(OnObjectAttributeUpdateJsNode.OUTPUT_PREV_VAL, 'getObjectAttributePrevious', type);

		// const out = this.jsVarName(OUTPUT_NAME);

		// const _ray = Poly.namedFunctionsRegister.getFunction('globalsRayFromCursor', this, shadersCollectionController);
		// shadersCollectionController.addDefinitions(this, [
		// 	new ComputedValueJsDefinition(
		// 		this,
		// 		shadersCollectionController,
		// 		JsConnectionPointType.RAY,
		// 		out,
		// 		_ray.asString()
		// 	),
		// ]);
	}
	// private _methodName() {
	// 	const functionNode = this.functionNode();
	// 	if (!functionNode) {
	// 		return this.type();
	// 	}
	// 	const relativePath = this.path().replace(functionNode.path(), '');
	// 	const methodName = CoreString.sanitizeName(relativePath);
	// 	return methodName;
	// }
	// override wrappedBodyLines(
	// 	shadersCollectionController: ShadersCollectionController,
	// 	bodyLines: string[],
	// 	existingMethodNames: Set<string>
	// ) {
	// 	const methodName = this._methodName();
	// 	//
	// 	const wrappedLines: string = `${methodName}(){

	// 		${bodyLines.join('\n')}
	// 	}`;
	// 	return {methodNames: [methodName], wrappedLines};
	// }

	override setTriggeringLines(shadersCollectionController: ShadersCollectionController, triggeredMethods: string) {
		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {
			gatherable: false,
		});
	}

	// override wrappedBodyLines(
	// 	shadersCollectionController: ShadersCollectionController,
	// 	bodyLines: string[],
	// 	existingMethodNames: Set<string>
	// ) {
	// 	const object3D = inputObject3D(this, shadersCollectionController);
	// 	const attribName = this.variableForInputParam(shadersCollectionController, this.p.attribName);

	// 	const methodName = this.type();
	// 	//
	// 	const wrappedLines: string = `${methodName}(){
	// 		if( !${bodyLine} ){
	// 			return
	// 		}
	// 		${bodyLines.join('\n')}
	// 	}`;
	// 	return {methodNames: [methodName], wrappedLines};
	// }

	// public override outputValue(
	// 	context: ActorNodeTriggerContext,
	// 	outputName: string
	// ): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
	// 	// switch (outputName) {
	// 	// 	case OnObjectAttributeUpdateActorNode.OUTPUT_NEW_VAL: {
	// 	// 		const val = CoreObject.attribValue(context.Object3D, this.attributeName());
	// 	// 		if (val != null) {
	// 	// 			return val as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
	// 	// 		}
	// 	// 	}
	// 	// 	case OnObjectAttributeUpdateActorNode.OUTPUT_PREV_VAL: {
	// 	// 		const val = CoreObject.previousAttribValue(context.Object3D, this.attributeName());
	// 	// 		if (val != null) {
	// 	// 			return val as ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType];
	// 	// 		}
	// 	// 	}
	// 	// }
	// }
}
