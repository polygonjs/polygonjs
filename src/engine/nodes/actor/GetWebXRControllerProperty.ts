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

enum GetWebXRControllerPropertyActorNodeInputName {
	Object3D = 'Object3D',
	Ray = 'Ray',
	hasLinearVelocity = 'hasLinearVelocity',
	linearVelocity = 'linearVelocity',
	hasAngularVelocity = 'hasAngularVelocity',
	angularVelocity = 'angularVelocity',
}

const tmpRay = new Ray();
const tmpV3 = new Vector3();

class GetWebXRControllerPropertyActorParamsConfig extends NodeParamsConfig {
	/** @param  controller index */
	controllerIndex = ParamConfig.INTEGER(0, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new GetWebXRControllerPropertyActorParamsConfig();

export class GetWebXRControllerPropertyActorNode extends TypedActorNode<GetWebXRControllerPropertyActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'getWebXRControllerProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(
				GetWebXRControllerPropertyActorNodeInputName.Object3D,
				ActorConnectionPointType.OBJECT_3D
			),
			new ActorConnectionPoint(GetWebXRControllerPropertyActorNodeInputName.Ray, ActorConnectionPointType.RAY),
			new ActorConnectionPoint(
				GetWebXRControllerPropertyActorNodeInputName.hasLinearVelocity,
				ActorConnectionPointType.BOOLEAN
			),
			new ActorConnectionPoint(
				GetWebXRControllerPropertyActorNodeInputName.linearVelocity,
				ActorConnectionPointType.VECTOR3
			),
			new ActorConnectionPoint(
				GetWebXRControllerPropertyActorNodeInputName.hasAngularVelocity,
				ActorConnectionPointType.BOOLEAN
			),
			new ActorConnectionPoint(
				GetWebXRControllerPropertyActorNodeInputName.angularVelocity,
				ActorConnectionPointType.VECTOR3
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetWebXRControllerPropertyActorNodeInputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const controllerIndex = this._inputValueFromParam<ParamType.INTEGER>(this.p.controllerIndex, context) || 0;
		const xrController = this.scene().webXR.activeXRController();

		switch (outputName) {
			case GetWebXRControllerPropertyActorNodeInputName.Object3D: {
				return xrController?.getController(controllerIndex).controller || context.Object3D;
			}
			case GetWebXRControllerPropertyActorNodeInputName.Ray: {
				const ray = xrController?.getController(controllerIndex).ray;
				if (ray) {
					tmpRay.copy(ray);
				}

				return tmpRay;
			}
			case GetWebXRControllerPropertyActorNodeInputName.hasLinearVelocity: {
				return xrController?.getController(controllerIndex).controller.hasLinearVelocity || false;
			}
			case GetWebXRControllerPropertyActorNodeInputName.linearVelocity: {
				const linearVelocity = xrController?.getController(controllerIndex).controller.linearVelocity;
				if (linearVelocity) {
					tmpV3.copy(linearVelocity);
				}

				return tmpRay;
			}
			case GetWebXRControllerPropertyActorNodeInputName.hasAngularVelocity: {
				return xrController?.getController(controllerIndex).controller.hasAngularVelocity || false;
			}
			case GetWebXRControllerPropertyActorNodeInputName.angularVelocity: {
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
