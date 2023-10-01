/**
 * Create a physics player
 *
 *
 */

import {CoreGroup} from '../../../core/geometry/Group';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {CorePhysicsAttribute, PhysicsRBDColliderType, PhysicsRBDType} from '../../../core/physics/PhysicsAttribute';
import {PhysicsPlayerType} from '../../../core/physics/player/PhysicsPlayer';
import {SphereBuilder} from '../../../core/geometry/builders/SphereBuilder';
import {ObjectType} from '../../../core/geometry/Constant';
import {CorePath} from '../../../core/geometry/CorePath';
import {BaseSopOperation} from '../../operations/sop/_Base';
import {Vector3, Object3D} from 'three';
import {TypedActorSopNode} from './_BaseActor';

// Note that the default used for torque player
// are different than the ones used for PhysicsRBDAttributes
const DEFAULT = {
	radius: 0.5,
	density: 5, //1000,
	friction: 1, //0.5,
	restitution: 0.5,
	linearDamping: 0.4, //0,
	angularDamping: 10,
	linearVelocity: new Vector3(0, 0, 0),
	angularVelocity: new Vector3(0, 0, 0),
	gravityScale: 1,
};
const type = PhysicsPlayerType.TORQUE;

class PhysicsPlayerSopParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param radius */
	radius = ParamConfig.FLOAT(0.5, {
		range: [0, 2],
		rangeLocked: [true, false],
	});

	/** @param density */
	density = ParamConfig.FLOAT(DEFAULT.density, {
		range: [0, 100],
		rangeLocked: [true, false],
		separatorBefore: true,
	});
	/** @param friction */
	friction = ParamConfig.FLOAT(DEFAULT.friction, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param restitution */
	restitution = ParamConfig.FLOAT(DEFAULT.restitution, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
	/** @param linear damping (affects velocity) */
	linearDamping = ParamConfig.FLOAT(DEFAULT.linearDamping, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param angular damping (affects rotations) */
	angularDamping = ParamConfig.FLOAT(DEFAULT.angularDamping, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param linear velocity */
	linearVelocity = ParamConfig.VECTOR3(DEFAULT.linearVelocity);
	/** @param angular velocity */
	angularVelocity = ParamConfig.VECTOR3(DEFAULT.angularVelocity);
	/** @param gravity Scale */
	gravityScale = ParamConfig.FLOAT(DEFAULT.gravityScale, {
		range: [-10, 10],
		rangeLocked: [false, false],
	});

	details = ParamConfig.FOLDER();
	/** @param id */
	id = ParamConfig.STRING('`$OS`');

	/** @param collision offset */
	// offset = ParamConfig.FLOAT(0.02, {
	// 	range: [0, 0.1],
	// 	rangeLocked: [true, false],
	// });
	// /** @param apply impulses */
	// applyImpulses = ParamConfig.BOOLEAN(1);
	// /** @param distance below which the player will be snapped to the ground */
	// snapToGroundDistance = ParamConfig.FLOAT(0.5, {
	// 	range: [0, 1],
	// 	rangeLocked: [true, false],
	// });
	// /** @param auto step */
	// autoStep = ParamConfig.BOOLEAN(1, {
	// 	separatorBefore: true,
	// });
	// /** @param auto step max height */
	// autoStepMaxHeight = ParamConfig.FLOAT(0.5, {
	// 	range: [0, 1],
	// 	rangeLocked: [true, false],
	// 	visibleIf: {autoStep: 1},
	// });
	// /** @param auto step max height */
	// autoStepMinWidth = ParamConfig.FLOAT(0.5, {
	// 	range: [0, 1],
	// 	rangeLocked: [true, false],
	// 	visibleIf: {autoStep: 1},
	// });
	// /** @param auto step on dynamic objects */
	// autoStepOnDynamic = ParamConfig.BOOLEAN(1, {
	// 	visibleIf: {autoStep: 1},
	// });
	// /** @param Don’t allow climbing slopes larger than this angle */
	// maxSlopeClimbAngle = ParamConfig.FLOAT(45, {
	// 	separatorBefore: true,
	// 	range: [0, 90],
	// 	rangeLocked: [true, true],
	// });
	// /** @param Automatically slide down on slopes smaller than this angle */
	// minSlopeSlideAngle = ParamConfig.FLOAT(30, {
	// 	range: [0, 90],
	// 	rangeLocked: [true, true],
	// });
	// /** @param up vector used in slope angle calculations */
	// up = ParamConfig.VECTOR3([0, 1, 0]);
}
const ParamsConfig = new PhysicsPlayerSopParamsConfig();

export class PhysicsPlayerSopNode extends TypedActorSopNode<PhysicsPlayerSopParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type(): SopType.PHYSICS_PLAYER {
		return SopType.PHYSICS_PLAYER;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(0, 2);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		this.compilationController.compileIfRequired();
		const coreGroup0 = inputCoreGroups[0];
		const coreGroup1 = inputCoreGroups[1];
		const inputObjects = coreGroup0 ? coreGroup0.threejsObjects() : this._createDefaultInputObjects();
		const playerObject = inputObjects[0];
		this._updatePlayerObject(playerObject);
		const objects = [playerObject];

		if (coreGroup1) {
			const cameraObject = coreGroup1.threejsObjects()[0];
			if (cameraObject) {
				objects.push(cameraObject);
				const cameraPath = CorePath.objectPath(cameraObject);
				CorePhysicsAttribute.setCharacterControllerCameraPath(playerObject, cameraPath);
			}
		}

		this.setObjects(objects);
	}
	private _updatePlayerObject(object: Object3D) {
		const actorNode = this._findActorNode();

		// for (let object of inputObjects) {
		// actor
		this.scene().actorsManager.assignActorBuilder(object, actorNode);
		// force rbd type
		CorePhysicsAttribute.setRBDType(
			object,
			type == PhysicsPlayerType.TORQUE ? PhysicsRBDType.DYNAMIC : PhysicsRBDType.KINEMATIC_POS
		);
		// collider
		CorePhysicsAttribute.setColliderType(object, PhysicsRBDColliderType.SPHERE);
		CorePhysicsAttribute.setRadius(object, this.pv.radius);

		// id
		const rbdId = this.pv.id;
		object.name = rbdId;
		CorePhysicsAttribute.setRBDId(object, rbdId);

		// set character controller id to rbd id
		// const rbdId = CorePhysicsAttribute.getRBDId(object);

		//
		CorePhysicsAttribute.setCharacterControllerId(object, rbdId);

		//
		CorePhysicsAttribute.setDensity(object, this.pv.density);
		CorePhysicsAttribute.setFriction(object, this.pv.friction);
		CorePhysicsAttribute.setRestitution(object, this.pv.restitution);
		CorePhysicsAttribute.setLinearDamping(object, this.pv.linearDamping);
		CorePhysicsAttribute.setAngularDamping(object, this.pv.angularDamping);
		CorePhysicsAttribute.setLinearVelocity(object, this.pv.linearVelocity);
		CorePhysicsAttribute.setAngularVelocity(object, this.pv.angularVelocity);
		CorePhysicsAttribute.setGravityScale(object, this.pv.gravityScale);

		//
		// CorePhysicsAttribute.setCharacterControllerOffset(object, this.pv.offset);
		// CorePhysicsAttribute.setCharacterControllerApplyImpulsesToDynamic(object, this.pv.applyImpulses);
		// CorePhysicsAttribute.setCharacterControllerSnapToGroundDistance(object, this.pv.snapToGroundDistance);
		// // auto step
		// if (isBooleanTrue(this.pv.autoStep)) {
		// 	CorePhysicsAttribute.setCharacterControllerAutoStepMaxHeight(object, this.pv.autoStepMaxHeight);
		// 	CorePhysicsAttribute.setCharacterControllerAutoStepMinWidth(object, this.pv.autoStepMinWidth);
		// 	CorePhysicsAttribute.setCharacterControllerAutoStepOnDynamic(object, this.pv.autoStepOnDynamic);
		// }
		// // slopes
		// CorePhysicsAttribute.setCharacterControllerMaxSlopeClimbAngle(object, this.pv.maxSlopeClimbAngle);
		// CorePhysicsAttribute.setCharacterControllerMinSlopeSlideAngle(object, this.pv.minSlopeSlideAngle);
		// CorePhysicsAttribute.setCharacterControllerUp(object, this.pv.up);
		// }
	}

	private _createDefaultInputObjects() {
		const geometry = SphereBuilder.create({
			radius: this.pv.radius,
			widthSegments: 30,
			heightSegments: 30,
			asLines: false,
			open: false,
		});
		const object = BaseSopOperation.createObject(geometry, ObjectType.MESH);
		return [object];
	}

	private _findActorNode() {
		// if (isBooleanTrue(this.pv.useThisNode)) {
		return this;
		// } else {
		// 	return this.pv.node.node() as ActorBuilderNode | undefined;
		// }
	}
}
