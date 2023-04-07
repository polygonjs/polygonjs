/**
 * get an XR controller property
 *
 *
 */

import {TypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {Ray, Vector3} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';
import {inputObject3D} from './_BaseObject3D';

enum GetWebXRControllerPropertyJsNodeInputName {
	Object3D = 'Object3D',
	Ray = 'Ray',
	hasLinearVelocity = 'hasLinearVelocity',
	linearVelocity = 'linearVelocity',
	hasAngularVelocity = 'hasAngularVelocity',
	angularVelocity = 'angularVelocity',
}

class GetWebXRControllerPropertyJsParamsConfig extends NodeParamsConfig {
	/** @param  controller index */
	controllerIndex = ParamConfig.INTEGER(0, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new GetWebXRControllerPropertyJsParamsConfig();

export class GetWebXRControllerPropertyJsNode extends TypedJsNode<GetWebXRControllerPropertyJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'getWebXRControllerProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetWebXRControllerPropertyJsNodeInputName.Object3D, JsConnectionPointType.OBJECT_3D),
			new JsConnectionPoint(GetWebXRControllerPropertyJsNodeInputName.Ray, JsConnectionPointType.RAY),
			new JsConnectionPoint(
				GetWebXRControllerPropertyJsNodeInputName.hasLinearVelocity,
				JsConnectionPointType.BOOLEAN
			),
			new JsConnectionPoint(
				GetWebXRControllerPropertyJsNodeInputName.linearVelocity,
				JsConnectionPointType.VECTOR3
			),
			new JsConnectionPoint(
				GetWebXRControllerPropertyJsNodeInputName.hasAngularVelocity,
				JsConnectionPointType.BOOLEAN
			),
			new JsConnectionPoint(
				GetWebXRControllerPropertyJsNodeInputName.angularVelocity,
				JsConnectionPointType.VECTOR3
			),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, shadersCollectionController);
		const controllerIndex = this.variableForInputParam(shadersCollectionController, this.p.controllerIndex);

		const _object = (
			propertyName: GetWebXRControllerPropertyJsNodeInputName,
			functionName: 'getWebXRControllerObject',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, controllerIndex),
				},
			]);
		};
		const _ray = (
			propertyName: GetWebXRControllerPropertyJsNodeInputName,
			functionName: 'getWebXRControllerRay',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new Ray());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, controllerIndex, varName),
				},
			]);
		};
		const _b = (
			propertyName: GetWebXRControllerPropertyJsNodeInputName,
			functionName: 'getWebXRControllerHasLinearVelocity' | 'getWebXRControllerHasAngularVelocity',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, controllerIndex),
				},
			]);
		};
		const _v3 = (
			propertyName: GetWebXRControllerPropertyJsNodeInputName,
			functionName: 'getWebXRControllerLinearVelocity' | 'getWebXRControllerAngularVelocity',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new Vector3());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, controllerIndex, varName),
				},
			]);
		};

		_object(
			GetWebXRControllerPropertyJsNodeInputName.Object3D,
			'getWebXRControllerObject',
			JsConnectionPointType.OBJECT_3D
		);
		_ray(GetWebXRControllerPropertyJsNodeInputName.Ray, 'getWebXRControllerRay', JsConnectionPointType.RAY);
		_b(
			GetWebXRControllerPropertyJsNodeInputName.hasAngularVelocity,
			'getWebXRControllerHasAngularVelocity',
			JsConnectionPointType.BOOLEAN
		);
		_v3(
			GetWebXRControllerPropertyJsNodeInputName.angularVelocity,
			'getWebXRControllerAngularVelocity',
			JsConnectionPointType.VECTOR3
		);
		_b(
			GetWebXRControllerPropertyJsNodeInputName.hasLinearVelocity,
			'getWebXRControllerHasLinearVelocity',
			JsConnectionPointType.BOOLEAN
		);
		_v3(
			GetWebXRControllerPropertyJsNodeInputName.linearVelocity,
			'getWebXRControllerLinearVelocity',
			JsConnectionPointType.VECTOR3
		);
	}
}
