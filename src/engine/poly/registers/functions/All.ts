import {PolyEngine} from '../../../Poly';
import {Vector2, Vector3, Vector4} from 'three';
//
import {addNumber, addVector, addVectorNumber} from '../../../functions/Add';
import {divideNumber, divideVectorNumber} from '../../../functions/Divide';
import {multNumber, multVector, multVectorNumber} from '../../../functions/Mult';
import {subtractNumber, subtractVector, subtractVectorNumber} from '../../../functions/Subtract';

import {
	getAnimationMixer,
	animationMixerUpdate,
	getAnimationAction,
	animationActionCrossFade,
	animationActionFadeIn,
	animationActionFadeOut,
	animationActionPlay,
	animationActionStop,
} from '../../../functions/AnimationMixer';
import {setPerspectiveCameraFov, setPerspectiveCameraNearFar} from '../../../functions/Camera';
import {
	boolToInt,
	intToBool,
	floatToInt,
	intToFloat,
	colorToVec3,
	floatToColor,
	floatToVec2,
	floatToVec3,
	floatToVec4,
	vec2ToVec3,
	vec3ToColor,
	vec3ToVec4,
} from '../../../functions/Conversion';
import {setSpotLightIntensity} from '../../../functions/Light';
import {
	setObjectMaterial,
	setObjectMaterialColor,
	setMaterialColor,
	setMaterialEmissiveColor,
	setMaterialOpacity,
	setMaterialUniformNumber,
	setMaterialUniformVectorColor,
} from '../../../functions/Material';
import {particlesSystemReset, particlesSystemStepSimulation} from '../../../functions/ParticlesSystem';
import {
	// globals
	physicsWorldReset,
	physicsWorldStepSimulation,
	// get shape
	getPhysicsRBDCapsuleRadius,
	getPhysicsRBDCapsuleHeight,
	getPhysicsRBDConeRadius,
	getPhysicsRBDConeHeight,
	getPhysicsRBDCuboidSizes,
	getPhysicsRBDCylinderRadius,
	getPhysicsRBDCylinderHeight,
	getPhysicsRBDSphereRadius,
	// set shape
	setPhysicsRBDCapsuleProperty,
	setPhysicsRBDConeProperty,
	setPhysicsRBDCuboidProperty,
	setPhysicsRBDCylinderProperty,
	setPhysicsRBDSphereProperty,
	// get RBD
	getPhysicsRBDAngularVelocity,
	getPhysicsRBDLinearVelocity,
	getPhysicsRBDAngularDamping,
	getPhysicsRBDLinearDamping,
	getPhysicsRBDIsSleeping,
	getPhysicsRBDIsMoving,
	// set RBD
	setPhysicsRBDPosition,
	setPhysicsRBDRotation,
	setPhysicsRBDAngularVelocity,
	setPhysicsRBDLinearVelocity,
	// set world
	setPhysicsWorldGravity,
	// forces
	physicsRBDAddForce,
	physicsRBDAddForceAtPoint,
	physicsRBDAddTorque,
	physicsRBDApplyImpulse,
	physicsRBDApplyImpulseAtPoint,
	physicsRBDApplyTorqueImpulse,
	physicsRBDRemove,
	physicsRBDResetAll,
	physicsRBDResetForces,
	physicsRBDResetTorques,
} from '../../../functions/Physics';
import {sizzleVec3XY, sizzleVec3XZ, sizzleVec3YZ, sizzleVec4XYZ} from '../../../functions/Sizzle';
import {
	globalsTime,
	globalsTimeDelta,
	globalsRaycaster,
	globalsRayFromCursor,
	globalsCursor,
} from '../../../functions/Globals';
import {planeSet} from '../../../functions/Plane';
import {rayIntersectPlane} from '../../../functions/Ray';
import {
	SDFUnion,
	SDFSubtract,
	SDFIntersect,
	SDFSmoothUnion,
	SDFSmoothSubtract,
	SDFSmoothIntersect,
} from '../../../functions/SDFOperations';
import {SDFRevolutionX, SDFRevolutionY, SDFRevolutionZ} from '../../../functions/SDFOperations2D';
import {SDFBox, SDFSphere} from '../../../functions/SDFPrimitives';
import {SDFRoundedX} from '../../../functions/SDFPrimitives2D';

//
import {keyboardEventMatchesConfig} from '../../../functions/KeyboardEventMatchesConfig';
import {getActorNodeParamValue} from '../../../functions/GetActorNodeParamValue';
import {getObject} from '../../../functions/GetObject';
import {getParent} from '../../../functions/GetParent';
import {getObjectAttribute} from '../../../functions/GetObjectAttribute';
import {getObjectAttributeRef} from '../../../functions/GetObjectAttributeRef';
import {getObjectHoveredState} from '../../../functions/GetObjectHoveredState';
import {getObjectProperty} from '../../../functions/GetObjectProperty';
import {setObjectAttribute} from '../../../functions/SetObjectAttribute';
import {setObjectLookAt} from '../../../functions/SetObjectLookAt';
import {setObjectPolarTransform} from '../../../functions/SetObjectPolarTransform';
import {setObjectPosition} from '../../../functions/SetObjectPosition';
import {setObjectRotation} from '../../../functions/SetObjectRotation';
import {
	setObjectCastShadow,
	setObjectFrustumCulled,
	setObjectMatrix,
	setObjectMatrixAutoUpdate,
	setObjectReceiveShadow,
	setObjectVisible,
} from '../../../functions/SetObjectProperty';
import {setObjectScale} from '../../../functions/SetObjectScale';

export interface NamedFunctionMap {
	addNumber: addNumber;
	addVector: addVector<Vector2 | Vector3 | Vector4>;
	addVectorNumber: addVectorNumber<Vector2 | Vector3 | Vector4>;
	animationActionCrossFade: animationActionCrossFade;
	animationActionFadeIn: animationActionFadeIn;
	animationActionFadeOut: animationActionFadeOut;
	animationActionPlay: animationActionPlay;
	animationActionStop: animationActionStop;
	animationMixerUpdate: animationMixerUpdate;
	boolToInt: boolToInt;
	colorToVec3: colorToVec3;
	divideNumber: divideNumber;
	divideVectorNumber: divideVectorNumber<Vector2 | Vector3 | Vector4>;
	floatToColor: floatToColor;
	floatToInt: floatToInt;
	floatToVec2: floatToVec2;
	floatToVec3: floatToVec3;
	floatToVec4: floatToVec4;
	getActorNodeParamValue: getActorNodeParamValue;
	getAnimationAction: getAnimationAction;
	getAnimationMixer: getAnimationMixer;
	getObject: getObject;
	getObjectAttribute: getObjectAttribute;
	getObjectAttributeRef: getObjectAttributeRef;
	getObjectHoveredState: getObjectHoveredState;
	getObjectProperty: getObjectProperty;
	getParent: getParent;
	getPhysicsRBDCapsuleHeight: getPhysicsRBDCapsuleHeight;
	getPhysicsRBDCapsuleRadius: getPhysicsRBDCapsuleRadius;
	getPhysicsRBDConeHeight: getPhysicsRBDConeHeight;
	getPhysicsRBDConeRadius: getPhysicsRBDConeRadius;
	getPhysicsRBDCuboidSizes: getPhysicsRBDCuboidSizes;
	getPhysicsRBDCylinderHeight: getPhysicsRBDCylinderHeight;
	getPhysicsRBDCylinderRadius: getPhysicsRBDCylinderRadius;
	getPhysicsRBDSphereRadius: getPhysicsRBDSphereRadius;
	getPhysicsRBDAngularVelocity: getPhysicsRBDAngularVelocity;
	getPhysicsRBDLinearVelocity: getPhysicsRBDLinearVelocity;
	getPhysicsRBDAngularDamping: getPhysicsRBDAngularDamping;
	getPhysicsRBDLinearDamping: getPhysicsRBDLinearDamping;
	getPhysicsRBDIsSleeping: getPhysicsRBDIsSleeping;
	getPhysicsRBDIsMoving: getPhysicsRBDIsMoving;
	globalsTime: globalsTime;
	globalsTimeDelta: globalsTimeDelta;
	globalsRaycaster: globalsRaycaster;
	globalsRayFromCursor: globalsRayFromCursor;
	globalsCursor: globalsCursor;
	intToBool: intToBool;
	intToFloat: intToFloat;
	keyboardEventMatchesConfig: keyboardEventMatchesConfig;
	multNumber: multNumber;
	multVector: multVector<Vector2 | Vector3 | Vector4>;
	multVectorNumber: multVectorNumber<Vector2 | Vector3 | Vector4>;
	particlesSystemReset: particlesSystemReset;
	particlesSystemStepSimulation: particlesSystemStepSimulation;
	physicsRBDAddForce: physicsRBDAddForce;
	physicsRBDAddForceAtPoint: physicsRBDAddForceAtPoint;
	physicsRBDAddTorque: physicsRBDAddTorque;
	physicsRBDApplyImpulse: physicsRBDApplyImpulse;
	physicsRBDApplyImpulseAtPoint: physicsRBDApplyImpulseAtPoint;
	physicsRBDApplyTorqueImpulse: physicsRBDApplyTorqueImpulse;
	physicsRBDRemove: physicsRBDRemove;
	physicsRBDResetAll: physicsRBDResetAll;
	physicsRBDResetForces: physicsRBDResetForces;
	physicsRBDResetTorques: physicsRBDResetTorques;
	physicsWorldReset: physicsWorldReset;
	physicsWorldStepSimulation: physicsWorldStepSimulation;
	planeSet: planeSet;
	rayIntersectPlane: rayIntersectPlane;
	SDFBox: SDFBox;
	SDFIntersect: SDFIntersect;
	SDFRevolutionX: SDFRevolutionX;
	SDFRevolutionY: SDFRevolutionY;
	SDFRevolutionZ: SDFRevolutionZ;
	SDFRoundedX: SDFRoundedX;
	SDFSmoothUnion: SDFSmoothUnion;
	SDFSmoothSubtract: SDFSmoothSubtract;
	SDFSmoothIntersect: SDFSmoothIntersect;
	SDFSphere: SDFSphere;
	SDFSubtract: SDFSubtract;
	SDFUnion: SDFUnion;
	setMaterialColor: setMaterialColor;
	setMaterialEmissiveColor: setMaterialEmissiveColor;
	setMaterialOpacity: setMaterialOpacity;
	setMaterialUniformNumber: setMaterialUniformNumber;
	setMaterialUniformVectorColor: setMaterialUniformVectorColor;
	setObjectAttribute: setObjectAttribute;
	setObjectLookAt: setObjectLookAt;
	setObjectMaterial: setObjectMaterial;
	setObjectMaterialColor: setObjectMaterialColor;
	setObjectPosition: setObjectPosition;
	setObjectPolarTransform: setObjectPolarTransform;
	setObjectRotation: setObjectRotation;
	setObjectCastShadow: setObjectCastShadow;
	setObjectFrustumCulled: setObjectFrustumCulled;
	setObjectMatrix: setObjectMatrix;
	setObjectMatrixAutoUpdate: setObjectMatrixAutoUpdate;
	setObjectReceiveShadow: setObjectReceiveShadow;
	setObjectVisible: setObjectVisible;
	setObjectScale: setObjectScale;
	setPerspectiveCameraFov: setPerspectiveCameraFov;
	setPerspectiveCameraNearFar: setPerspectiveCameraNearFar;
	setPhysicsRBDCapsuleProperty: setPhysicsRBDCapsuleProperty;
	setPhysicsRBDConeProperty: setPhysicsRBDConeProperty;
	setPhysicsRBDCuboidProperty: setPhysicsRBDCuboidProperty;
	setPhysicsRBDCylinderProperty: setPhysicsRBDCylinderProperty;
	setPhysicsRBDSphereProperty: setPhysicsRBDSphereProperty;
	setPhysicsRBDPosition: setPhysicsRBDPosition;
	setPhysicsRBDRotation: setPhysicsRBDRotation;
	setPhysicsRBDAngularVelocity: setPhysicsRBDAngularVelocity;
	setPhysicsRBDLinearVelocity: setPhysicsRBDLinearVelocity;
	setPhysicsWorldGravity: setPhysicsWorldGravity;
	setSpotLightIntensity: setSpotLightIntensity;
	sizzleVec3XY: sizzleVec3XY;
	sizzleVec3XZ: sizzleVec3XZ;
	sizzleVec3YZ: sizzleVec3YZ;
	sizzleVec4XYZ: sizzleVec4XYZ;
	subtractNumber: subtractNumber;
	subtractVector: subtractVector<Vector2 | Vector3 | Vector4>;
	subtractVectorNumber: subtractVectorNumber<Vector2 | Vector3 | Vector4>;
	vec2ToVec3: vec2ToVec3;
	vec3ToColor: vec3ToColor;
	vec3ToVec4: vec3ToVec4;
}

export class AllNamedFunctionRegister {
	static run(poly: PolyEngine) {
		[
			addNumber,
			addVector,
			addVectorNumber,
			animationActionCrossFade,
			animationActionFadeIn,
			animationActionFadeOut,
			animationActionPlay,
			animationActionStop,
			animationMixerUpdate,
			boolToInt,
			colorToVec3,
			divideNumber,
			divideVectorNumber,
			floatToColor,
			floatToInt,
			floatToVec2,
			floatToVec3,
			floatToVec4,
			getActorNodeParamValue,
			getAnimationAction,
			getAnimationMixer,
			getObject,
			getObjectAttribute,
			getObjectAttributeRef,
			getObjectHoveredState,
			getObjectProperty,
			getParent,
			getPhysicsRBDCapsuleHeight,
			getPhysicsRBDCapsuleRadius,
			getPhysicsRBDConeHeight,
			getPhysicsRBDConeRadius,
			getPhysicsRBDCuboidSizes,
			getPhysicsRBDCylinderHeight,
			getPhysicsRBDCylinderRadius,
			getPhysicsRBDSphereRadius,
			getPhysicsRBDAngularVelocity,
			getPhysicsRBDLinearVelocity,
			getPhysicsRBDAngularDamping,
			getPhysicsRBDLinearDamping,
			getPhysicsRBDIsSleeping,
			getPhysicsRBDIsMoving,
			globalsTime,
			globalsTimeDelta,
			globalsRaycaster,
			globalsRayFromCursor,
			globalsCursor,
			intToBool,
			intToFloat,
			keyboardEventMatchesConfig,
			multNumber,
			multVector,
			multVectorNumber,
			particlesSystemReset,
			particlesSystemStepSimulation,
			planeSet,
			physicsRBDAddForce,
			physicsRBDAddForceAtPoint,
			physicsRBDAddTorque,
			physicsRBDApplyImpulse,
			physicsRBDApplyImpulseAtPoint,
			physicsRBDApplyTorqueImpulse,
			physicsRBDRemove,
			physicsRBDResetAll,
			physicsRBDResetForces,
			physicsRBDResetTorques,
			physicsWorldReset,
			physicsWorldStepSimulation,
			rayIntersectPlane,
			SDFBox,
			SDFIntersect,
			SDFRevolutionX,
			SDFRevolutionY,
			SDFRevolutionZ,
			SDFRoundedX,
			SDFSmoothUnion,
			SDFSmoothSubtract,
			SDFSmoothIntersect,
			SDFSphere,
			SDFSubtract,
			SDFUnion,
			setMaterialColor,
			setMaterialEmissiveColor,
			setMaterialOpacity,
			setMaterialUniformNumber,
			setMaterialUniformVectorColor,
			setObjectAttribute,
			setObjectLookAt,
			setObjectMaterial,
			setObjectMaterialColor,
			setObjectCastShadow,
			setObjectFrustumCulled,
			setObjectMatrix,
			setObjectMatrixAutoUpdate,
			setObjectPosition,
			setObjectPolarTransform,
			setObjectReceiveShadow,
			setObjectRotation,
			setObjectVisible,
			setObjectScale,
			setPerspectiveCameraFov,
			setPerspectiveCameraNearFar,
			setPhysicsRBDCapsuleProperty,
			setPhysicsRBDConeProperty,
			setPhysicsRBDCuboidProperty,
			setPhysicsRBDCylinderProperty,
			setPhysicsRBDSphereProperty,
			setPhysicsRBDPosition,
			setPhysicsRBDRotation,
			setPhysicsRBDAngularVelocity,
			setPhysicsRBDLinearVelocity,
			setPhysicsWorldGravity,
			setSpotLightIntensity,
			sizzleVec3XY,
			sizzleVec3XZ,
			sizzleVec3YZ,
			sizzleVec4XYZ,
			subtractNumber,
			subtractVector,
			subtractVectorNumber,
			vec2ToVec3,
			vec3ToColor,
			vec3ToVec4,
		].forEach((f) => poly.registerNamedFunction(f));
	}
}
