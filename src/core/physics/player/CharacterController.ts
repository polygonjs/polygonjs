import type {World} from '@dimforge/rapier3d';
import {Object3D, Vector3} from 'three';
import {CorePhysicsAttribute} from '../PhysicsAttribute';
const up = new Vector3();
export function createCharacterController(world: World, object: Object3D) {
	const offset = CorePhysicsAttribute.getCharacterControllerOffset(object);

	const snapToGroundDistance = CorePhysicsAttribute.getCharacterControllerSnapToGroundDistance(object);
	const applyImpulsesToDynamic = CorePhysicsAttribute.getCharacterControllerApplyImpulsesToDynamic(object);
	// autostep
	const autoStepMaxHeight = CorePhysicsAttribute.getCharacterControllerAutoStepMaxHeight(object);
	const autoStepMinWidth = CorePhysicsAttribute.getCharacterControllerAutoStepMinWidth(object);
	const autoStepOnDynamic = CorePhysicsAttribute.getCharacterControllerAutoStepOnDynamic(object);
	// slopes
	CorePhysicsAttribute.getCharacterControllerUp(object, up);
	const maxSlopeClimbAngle = CorePhysicsAttribute.getCharacterControllerMaxSlopeClimbAngle(object);
	const minSlopeSlideAngle = CorePhysicsAttribute.getCharacterControllerMinSlopeSlideAngle(object);
	const characterController = world.createCharacterController(offset);
	console.log(offset, characterController);

	// use attributes
	console.log({
		offset,
		up,
		applyImpulsesToDynamic,
		snapToGroundDistance,
		autoStepMaxHeight,
		autoStepMinWidth,
		autoStepOnDynamic,
		maxSlopeClimbAngle,
		minSlopeSlideAngle,
	});
	characterController.setUp(up);
	characterController.setApplyImpulsesToDynamicBodies(applyImpulsesToDynamic);
	if (snapToGroundDistance) {
		characterController.enableSnapToGround(snapToGroundDistance);
	} else {
		characterController.disableSnapToGround();
	}
	// auto step
	if (autoStepMaxHeight && autoStepMinWidth) {
		characterController.enableAutostep(autoStepMaxHeight, autoStepMinWidth, autoStepOnDynamic);
	} else {
		characterController.disableAutostep();
	}
	// slopes
	characterController.setMaxSlopeClimbAngle((maxSlopeClimbAngle * Math.PI) / 180);
	characterController.setMinSlopeSlideAngle((minSlopeSlideAngle * Math.PI) / 180);
	return characterController;
}
