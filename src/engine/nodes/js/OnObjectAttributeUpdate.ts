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
	PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES,
	// ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {inputObject3D} from './_BaseObject3D';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {WatchedValueJsDefinition, ComputedValueJsDefinition} from './utils/JsDefinition';
import {Poly} from '../../Poly';
import {CoreString} from '../../../core/String';
// import {CoreObject} from '../../../core/geometry/Object';
enum OnObjectAttributeUpdateInputName {
	attribName = 'attribName',
}

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OnObjectAttributeUpdateJsParamsConfig extends NodeParamsConfig {
	attribName = ParamConfig.STRING('');
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

	static readonly OUTPUT_NEW_VAL = 'newValue';
	static readonly OUTPUT_PREV_VAL = 'previousValue';
	override initializeNode() {
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

	setAttribType(type: JsConnectionPointType) {
		this.p.type.set(PARAM_CONVERTIBLE_JS_CONNECTION_POINT_TYPES.indexOf(type));
	}
	attributeName() {
		return this.pv.attribName;
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);
		const attribName = this.variableForInput(
			shadersCollectionController,
			OnObjectAttributeUpdateInputName.attribName
		);
		console.log('A', object3D, attribName);

		const out = this.jsVarName('out');
		const getObjectAttributeRef = Poly.namedFunctionsRegister.getFunction(
			'getObjectAttributeRef',
			this,
			shadersCollectionController
		);
		shadersCollectionController.addDefinitions(this, [
			new ComputedValueJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.FLOAT,
				out,
				getObjectAttributeRef.asString(object3D, attribName)
			),
			new WatchedValueJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.FLOAT,
				out,
				`this.${this._methodName()}()`
			),
		]);

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
	private _methodName() {
		const functionNode = this.functionNode();
		if (!functionNode) {
			return this.type();
		}
		const relativePath = this.path().replace(functionNode.path(), '');
		const methodName = CoreString.sanitizeName(relativePath);
		return methodName;
	}
	override wrappedBodyLines(
		shadersCollectionController: ShadersCollectionController,
		bodyLines: string[],
		existingMethodNames: Set<string>
	) {
		const methodName = this._methodName();
		//
		const wrappedLines: string = `${methodName}(){

			${bodyLines.join('\n')}
		}`;
		return {methodNames: [methodName], wrappedLines};
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
