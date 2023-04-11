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
import {WatchedValueJsDefinition} from './utils/JsDefinition';
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

		this.io.connection_points.set_expected_input_types_function(() => []);
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
	setAttribName(attribName: string) {
		(this.params.get(OnObjectAttributeUpdateInputName.attribName) as StringParam).set(attribName);
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
				shadersCollectionController.addVariable(this, varName, variable);
			}
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, attribName, `'${type}'`),
				},
			]);
		};

		_val(OnObjectAttributeUpdateJsNode.OUTPUT_NEW_VAL, 'getObjectAttribute', type);
		_val(OnObjectAttributeUpdateJsNode.OUTPUT_PREV_VAL, 'getObjectAttributePrevious', type);
	}

	override setTriggeringLines(shadersCollectionController: ShadersCollectionController, triggeredMethods: string) {
		const type = this.attribType();
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.variableForInput(
			shadersCollectionController,
			OnObjectAttributeUpdateInputName.attribName
		);

		const getObjectAttributeRef = Poly.namedFunctionsRegister.getFunction(
			'getObjectAttributeRef',
			this,
			shadersCollectionController
		);

		shadersCollectionController.addDefinitions(this, [
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
		]);

		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {
			gatherable: false,
		});
	}
}
