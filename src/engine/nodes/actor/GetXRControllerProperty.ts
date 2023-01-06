/**
 * get an XR controller property
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {Ray, Vector3} from 'three';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ParamType} from '../../poly/ParamType';
import {TypeAssert} from '../../poly/Assert';

enum GetXRControllerPropertyActorNodeInputName {
	Object3D = 'Object3D',
	Ray = 'Ray',
	hasLinearVelocity = 'hasLinearVelocity',
	linearVelocity = 'linearVelocity',
	hasAngularVelocity = 'hasAngularVelocity',
	angularVelocity = 'angularVelocity',
}

const tmpRay = new Ray();
const tmpV3 = new Vector3();

class GetXRControllerPropertyActorParamsConfig extends NodeParamsConfig {
	/** @param  controller index */
	controllerIndex = ParamConfig.INTEGER(0, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new GetXRControllerPropertyActorParamsConfig();

export class GetXRControllerPropertyActorNode extends TypedActorNode<GetXRControllerPropertyActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'getXRControllerProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(
				GetXRControllerPropertyActorNodeInputName.Object3D,
				ActorConnectionPointType.OBJECT_3D
			),
			new ActorConnectionPoint(GetXRControllerPropertyActorNodeInputName.Ray, ActorConnectionPointType.RAY),
			new ActorConnectionPoint(
				GetXRControllerPropertyActorNodeInputName.hasLinearVelocity,
				ActorConnectionPointType.BOOLEAN
			),
			new ActorConnectionPoint(
				GetXRControllerPropertyActorNodeInputName.linearVelocity,
				ActorConnectionPointType.VECTOR3
			),
			new ActorConnectionPoint(
				GetXRControllerPropertyActorNodeInputName.hasAngularVelocity,
				ActorConnectionPointType.BOOLEAN
			),
			new ActorConnectionPoint(
				GetXRControllerPropertyActorNodeInputName.angularVelocity,
				ActorConnectionPointType.VECTOR3
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetXRControllerPropertyActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const controllerIndex = this._inputValueFromParam<ParamType.INTEGER>(this.p.controllerIndex, context) || 0;
		const xrController = this.scene().xr.XRController();

		switch (outputName) {
			case GetXRControllerPropertyActorNodeInputName.Object3D: {
				return xrController?.getController(controllerIndex).controller || context.Object3D;
			}
			case GetXRControllerPropertyActorNodeInputName.Ray: {
				const ray = xrController?.getController(controllerIndex).ray;
				if (ray) {
					tmpRay.copy(ray);
				}

				return tmpRay;
			}
			case GetXRControllerPropertyActorNodeInputName.hasLinearVelocity: {
				return xrController?.getController(controllerIndex).controller.hasLinearVelocity || false;
			}
			case GetXRControllerPropertyActorNodeInputName.linearVelocity: {
				const linearVelocity = xrController?.getController(controllerIndex).controller.linearVelocity;
				if (linearVelocity) {
					tmpV3.copy(linearVelocity);
				}

				return tmpRay;
			}
			case GetXRControllerPropertyActorNodeInputName.hasAngularVelocity: {
				return xrController?.getController(controllerIndex).controller.hasAngularVelocity || false;
			}
			case GetXRControllerPropertyActorNodeInputName.angularVelocity: {
				const angularVelocity = xrController?.getController(controllerIndex).controller.angularVelocity;
				if (angularVelocity) {
					tmpV3.copy(angularVelocity);
				}

				return tmpRay;
			}
		}
		TypeAssert.unreachable(outputName);
	}
}
