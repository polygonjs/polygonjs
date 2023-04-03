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
import {
	arrayLength,
	elementsToArrayPrimitive,
	elementsToArrayVector,
	arrayElementPrimitive,
	arrayElementVector,
} from '../../../functions/Array';
import {box3Set, getBox3Min, getBox3Max} from '../../../functions/Box3';
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
import {debug} from '../../../functions/Debug';
import {setGeometryPositions} from '../../../functions/Geometry';
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
import {
	sizzleVec3XY,
	sizzleVec3XZ,
	sizzleVec3YZ,
	sizzleVec4XYZ,
	sizzleVec4WArray,
	sizzleVec4XYZArray,
} from '../../../functions/Sizzle';
import {trackFace, trackFaceGetLandmarks} from '../../../functions/TrackingFace';
import {
	trackHand,
	trackHandGetNormalizedLandmarks,
	trackHandGetWorldLandmarks,
	getTrackedHandIndexDirection,
	getTrackedHandMiddleDirection,
	getTrackedHandPinkyDirection,
	getTrackedHandRingDirection,
	getTrackedHandThumbDirection,
} from '../../../functions/TrackingHand';
import {
	globalsTime,
	globalsTimeDelta,
	globalsRaycaster,
	globalsRayFromCursor,
	globalsCursor,
} from '../../../functions/Globals';
import {planeSet, getPlaneNormal, getPlaneConstant} from '../../../functions/Plane';
import {
	raySet,
	rayFromCamera,
	getRayDirection,
	getRayOrigin,
	rayIntersectBox3,
	rayIntersectsBox3,
	rayIntersectObject3D,
	rayIntersectsObject3D,
	rayIntersectPlane,
	rayIntersectsPlane,
	rayDistanceToPlane,
	rayIntersectSphere,
	rayIntersectsSphere,
} from '../../../functions/Ray';
import {getMaterial, getTexture} from '../../../functions/GetSceneObject';
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
import {sphereSet, getSphereCenter, getSphereRadius} from '../../../functions/Sphere';
import {vector3AngleTo, vector3Project, vector3ProjectOnPlane, vector3Unproject} from '../../../functions/Vector';

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
import {PrimitiveArrayElement, VectorArrayElement} from '../../../nodes/utils/io/connections/Js';

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
	arrayElementPrimitive: arrayElementPrimitive<PrimitiveArrayElement>;
	arrayElementVector: arrayElementVector;
	arrayLength: arrayLength;
	boolToInt: boolToInt;
	box3Set: box3Set;
	colorToVec3: colorToVec3;
	debug: debug<any>;
	divideNumber: divideNumber;
	divideVectorNumber: divideVectorNumber<Vector2 | Vector3 | Vector4>;
	elementsToArrayPrimitive: elementsToArrayPrimitive<PrimitiveArrayElement>;
	elementsToArrayVector: elementsToArrayVector<VectorArrayElement>;
	floatToColor: floatToColor;
	floatToInt: floatToInt;
	floatToVec2: floatToVec2;
	floatToVec3: floatToVec3;
	floatToVec4: floatToVec4;
	getActorNodeParamValue: getActorNodeParamValue;
	getAnimationAction: getAnimationAction;
	getAnimationMixer: getAnimationMixer;
	getBox3Min: getBox3Min;
	getBox3Max: getBox3Max;
	getMaterial: getMaterial;
	getObject: getObject;
	getObjectAttribute: getObjectAttribute;
	getObjectAttributeRef: getObjectAttributeRef;
	getObjectHoveredState: getObjectHoveredState;
	getObjectProperty: getObjectProperty;
	getParent: getParent;
	getPlaneNormal: getPlaneNormal;
	getPlaneConstant: getPlaneConstant;
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
	getRayDirection: getRayDirection;
	getRayOrigin: getRayOrigin;
	getSphereCenter: getSphereCenter;
	getSphereRadius: getSphereRadius;
	getTexture: getTexture;
	getTrackedHandIndexDirection: getTrackedHandIndexDirection;
	getTrackedHandMiddleDirection: getTrackedHandMiddleDirection;
	getTrackedHandPinkyDirection: getTrackedHandPinkyDirection;
	getTrackedHandRingDirection: getTrackedHandRingDirection;
	getTrackedHandThumbDirection: getTrackedHandThumbDirection;
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
	raySet: raySet;
	rayFromCamera: rayFromCamera;
	rayIntersectBox3: rayIntersectBox3;
	rayIntersectsBox3: rayIntersectsBox3;
	rayIntersectObject3D: rayIntersectObject3D;
	rayIntersectsObject3D: rayIntersectsObject3D;
	rayIntersectPlane: rayIntersectPlane;
	rayIntersectsPlane: rayIntersectsPlane;
	rayDistanceToPlane: rayDistanceToPlane;
	rayIntersectSphere: rayIntersectSphere;
	rayIntersectsSphere: rayIntersectsSphere;
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
	setGeometryPositions: setGeometryPositions;
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
	sizzleVec4WArray: sizzleVec4WArray;
	sizzleVec4XYZArray: sizzleVec4XYZArray;
	sphereSet: sphereSet;
	subtractNumber: subtractNumber;
	subtractVector: subtractVector<Vector2 | Vector3 | Vector4>;
	subtractVectorNumber: subtractVectorNumber<Vector2 | Vector3 | Vector4>;
	trackFace: trackFace;
	trackFaceGetLandmarks: trackFaceGetLandmarks;
	trackHand: trackHand;
	trackHandGetNormalizedLandmarks: trackHandGetNormalizedLandmarks;
	trackHandGetWorldLandmarks: trackHandGetWorldLandmarks;
	vector3AngleTo: vector3AngleTo;
	vector3Project: vector3Project;
	vector3ProjectOnPlane: vector3ProjectOnPlane;
	vector3Unproject: vector3Unproject;
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
			arrayElementPrimitive,
			arrayElementVector,
			arrayLength,
			boolToInt,
			box3Set,
			colorToVec3,
			debug,
			divideNumber,
			divideVectorNumber,
			elementsToArrayPrimitive,
			elementsToArrayVector,
			floatToColor,
			floatToInt,
			floatToVec2,
			floatToVec3,
			floatToVec4,
			getActorNodeParamValue,
			getAnimationAction,
			getAnimationMixer,
			getBox3Min,
			getBox3Max,
			getMaterial,
			getObject,
			getObjectAttribute,
			getObjectAttributeRef,
			getObjectHoveredState,
			getObjectProperty,
			getParent,
			getPlaneNormal,
			getPlaneConstant,
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
			getRayDirection,
			getRayOrigin,
			getSphereCenter,
			getSphereRadius,
			getTexture,
			getTrackedHandIndexDirection,
			getTrackedHandMiddleDirection,
			getTrackedHandPinkyDirection,
			getTrackedHandRingDirection,
			getTrackedHandThumbDirection,
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
			raySet,
			rayFromCamera,
			rayIntersectBox3,
			rayIntersectsBox3,
			rayIntersectObject3D,
			rayIntersectsObject3D,
			rayIntersectPlane,
			rayIntersectsPlane,
			rayDistanceToPlane,
			rayIntersectSphere,
			rayIntersectsSphere,
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
			setGeometryPositions,
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
			sizzleVec4WArray,
			sizzleVec4XYZArray,
			sphereSet,
			subtractNumber,
			subtractVector,
			subtractVectorNumber,
			trackFace,
			trackFaceGetLandmarks,
			trackHand,
			trackHandGetNormalizedLandmarks,
			trackHandGetWorldLandmarks,
			vector3AngleTo,
			vector3Project,
			vector3ProjectOnPlane,
			vector3Unproject,
			vec2ToVec3,
			vec3ToColor,
			vec3ToVec4,
		].forEach((f) => poly.registerNamedFunction(f));
	}
}
