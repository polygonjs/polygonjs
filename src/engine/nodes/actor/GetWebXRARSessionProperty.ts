/**
 * get a property from an AR session
 *
 *
 */

import {ActorNodeTriggerContext, TypedActorNode} from './_Base';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

import {TypeAssert} from '../../poly/Assert';
import {Matrix4, Quaternion, Vector3} from 'three';

export enum GetARSessionPropertyActorNodeOutputName {
	hitDetected = 'hitDetected',
	hitMatrix = 'hitMatrix',
	hitPosition = 'hitPosition',
	hitQuaternion = 'hitQuaternion',
}

const tmpMat4 = new Matrix4();
const tmpV3 = new Vector3();
const tmpQuaternion = new Quaternion();

class GetWebXRARSessionPropertyActorParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GetWebXRARSessionPropertyActorParamsConfig();

export class GetWebXRARSessionPropertyActorNode extends TypedActorNode<GetWebXRARSessionPropertyActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'getWebXRARSessionProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(
				GetARSessionPropertyActorNodeOutputName.hitDetected,
				ActorConnectionPointType.BOOLEAN
			),
			new ActorConnectionPoint(
				GetARSessionPropertyActorNodeOutputName.hitMatrix,
				ActorConnectionPointType.MATRIX4
			),
			new ActorConnectionPoint(
				GetARSessionPropertyActorNodeOutputName.hitPosition,
				ActorConnectionPointType.VECTOR3
			),
			new ActorConnectionPoint(
				GetARSessionPropertyActorNodeOutputName.hitQuaternion,
				ActorConnectionPointType.QUATERNION
			),
		]);
	}

	public override outputValue(
		context: ActorNodeTriggerContext,
		outputName: GetARSessionPropertyActorNodeOutputName
	): ReturnValueTypeByActorConnectionPointType[ActorConnectionPointType] | undefined {
		const arController = this.scene().webXR.activeARController();
		switch (outputName) {
			case GetARSessionPropertyActorNodeOutputName.hitDetected: {
				return arController?.hitDetected() || false;
			}
			case GetARSessionPropertyActorNodeOutputName.hitMatrix: {
				arController?.hitMatrix(tmpMat4);
				return tmpMat4;
			}
			case GetARSessionPropertyActorNodeOutputName.hitPosition: {
				arController?.hitPosition(tmpV3);
				return tmpV3;
			}
			case GetARSessionPropertyActorNodeOutputName.hitQuaternion: {
				arController?.hitQuaternion(tmpQuaternion);
				return tmpQuaternion;
			}
		}
		TypeAssert.unreachable(outputName);
	}
}
