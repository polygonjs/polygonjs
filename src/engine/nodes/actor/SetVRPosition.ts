// /**
//  * Update the VR player position
//  *
//  *
//  */

// import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// import {Quaternion} from 'three';
// import {
// 	ActorConnectionPoint,
// 	ActorConnectionPointType,
// 	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
// } from '../utils/io/connections/Actor';
// import {ParamType} from '../../poly/ParamType';

// const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

// class SetVRPositionActorParamsConfig extends NodeParamsConfig {
// 	/** @param target position */
// 	position = ParamConfig.VECTOR3([0, 0, 0]);
// }
// const ParamsConfig = new SetVRPositionActorParamsConfig();

// export class SetVRPositionActorNode extends TypedActorNode<SetVRPositionActorParamsConfig> {
// 	override readonly paramsConfig = ParamsConfig;
// 	static override type() {
// 		return 'setVRPosition';
// 	}

// 	override initializeNode() {
// 		this.io.inputs.setNamedInputConnectionPoints([
// 			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
// 		]);

// 		this.io.outputs.setNamedOutputConnectionPoints([
// 			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
// 		]);
// 	}

// 	public override receiveTrigger(context: ActorNodeTriggerContext) {
// 		const position = this._inputValueFromParam<ParamType.VECTOR3>(this.p.position, context);

// 		const VRController = this.scene().xr.VRController();
// 		if (VRController) {
// 			const baseReferenceSpace = VRController.baseReferenceSpace();
// 			if (baseReferenceSpace) {
// 				const offsetPosition = {x: -position.x, y: -position.y, z: -position.z, w: 1};
// 				const offsetRotation = new Quaternion();
// 				const transform = new XRRigidTransform(offsetPosition, offsetRotation);
// 				const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);

// 				VRController.setReferenceSpace(teleportSpaceOffset);
// 			}
// 		}

// 		this.runTrigger(context);
// 	}
// }
