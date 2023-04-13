import {PolyEngine} from '../../../Poly';
import {Color, Vector2, Vector3, Vector4} from 'three';
//
import {addNumber, addVector, addVectorNumber} from '../../../functions/_Add';
import {divideNumber, divideVectorNumber} from '../../../functions/_Divide';
import {multNumber, multVector, multVectorNumber} from '../../../functions/_Mult';
import {subtractNumber, subtractVector, subtractVectorNumber} from '../../../functions/_Subtract';

import {playAnimation} from '../../../functions/_Animation';
import {
	getAnimationMixer,
	animationMixerUpdate,
	getAnimationAction,
	animationActionCrossFade,
	animationActionFadeIn,
	animationActionFadeOut,
	animationActionPlay,
	animationActionStop,
} from '../../../functions/_AnimationMixer';
import {
	arrayLength,
	elementsToArrayPrimitive,
	elementsToArrayVector,
	arrayElementPrimitive,
	arrayElementVector,
} from '../../../functions/_Array';
import {
	addAudioStopEventListener,
	playAudioSource,
	pauseAudioSource,
	playInstrumentNote,
} from '../../../functions/_Audio';
import {box3Set, getBox3Min, getBox3Max} from '../../../functions/_Box3';
import {setPerspectiveCameraFov, setPerspectiveCameraNearFar, getDefaultCamera} from '../../../functions/_Camera';
import {colorSetRGB} from '../../../functions/_Color';
import {cookNode} from '../../../functions/_CookNode';
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
} from '../../../functions/_Conversion';
import {catmullRomCurve3GetPoint} from '../../../functions/_Curve';
import {debug} from '../../../functions/_Debug';
import {
	easeI2,
	easeO2,
	easeIO2,
	easeI3,
	easeO3,
	easeIO3,
	easeI4,
	easeO4,
	easeIO4,
	easeSinI,
	easeSinO,
	easeSinIO,
	easeElasticI,
	easeElasticO,
	easeElasticIO,
} from '../../../functions/_Easing';
import {setGeometryPositions} from '../../../functions/_Geometry';
import {
	getIntersectionPropertyDistance,
	getIntersectionPropertyNormal,
	getIntersectionPropertyObject,
	getIntersectionPropertyPoint,
	getIntersectionPropertyUv,
} from '../../../functions/_GetIntersectionProperty';
import {getMaterial, getTexture} from '../../../functions/_GetSceneObject';
import {
	globalsTime,
	globalsTimeDelta,
	globalsRaycaster,
	globalsRayFromCursor,
	globalsCursor,
} from '../../../functions/_Globals';
import {
	setGeometryInstancePositions,
	setGeometryInstanceQuaternions,
	setGeometryInstanceScales,
	setGeometryInstanceTransforms,
	setGeometryInstanceAttributeFloat,
	setGeometryInstanceAttributeVector2,
	setGeometryInstanceAttributeVector3,
	setGeometryInstanceAttributeVector4,
	setGeometryInstanceAttributeQuaternion,
	setGeometryInstanceAttributeColor,
} from '../../../functions/_Instance';
import {lerpColor, lerpNumber, lerpQuaternion, lerpVector2, lerpVector3, lerpVector4} from '../../../functions/_Lerp';
import {setSpotLightIntensity} from '../../../functions/_Light';
import {andArrays, andBooleans, orArrays, orBooleans} from '../../../functions/_Logic';
import {
	setObjectMaterial,
	setObjectMaterialColor,
	setMaterialColor,
	setMaterialEmissiveColor,
	setMaterialOpacity,
	setMaterialUniformNumber,
	setMaterialUniformVectorColor,
} from '../../../functions/_Material';
import {
	mathColor_1,
	mathColor_2,
	mathColor_3,
	mathColor_3vvf,
	mathColor_4,
	mathColor_5,
	mathFloat_1,
	mathFloat_2,
	mathFloat_3,
	mathFloat_4,
	mathFloat_5,
	mathPrimArray_1,
	mathPrimArray_2,
	mathPrimArray_3,
	mathPrimArray_4,
	mathPrimArray_5,
	mathVector2_1,
	mathVector2_2,
	mathVector2_3,
	mathVector2_3vvf,
	mathVector2_4,
	mathVector2_5,
	mathVector3_1,
	mathVector3_2,
	mathVector3_3,
	mathVector3_3vvf,
	mathVector3_4,
	mathVector3_5,
	mathVector4_1,
	mathVector4_2,
	mathVector4_3,
	mathVector4_3vvf,
	mathVector4_4,
	mathVector4_5,
	mathVectorArray_1,
	mathVectorArray_2,
	mathVectorArray_3,
	mathVectorArray_4,
	mathVectorArray_5,
	MathArrayVectorElement,
} from '../../../functions/_MathGeneric';
import {
	clamp,
	complement,
	fit,
	fitClamp,
	mix,
	multAdd,
	negate,
	rand,
	random,
	smoothstep,
} from '../../../functions/_Math';
import {
	multScalarArrayVectorArray,
	multScalarColor,
	multScalarVector2,
	multScalarVector3,
	multScalarVector4,
	multScalarVectorArray,
} from '../../../functions/_MultScalar';
import {nearestPosition} from '../../../functions/_NearestPosition';
import {
	setPlayerInput,
	getPlayerInputDataLeft,
	getPlayerInputDataRight,
	getPlayerInputDataBackward,
	getPlayerInputDataForward,
	getPlayerInputDataJump,
	getPlayerInputDataRun,
} from '../../../functions/_SetPlayerInput';
import {particlesSystemReset, particlesSystemStepSimulation} from '../../../functions/_ParticlesSystem';
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
	// get Children RBD,
	getChildrenPhysicsRBDPropertiesAngularDamping,
	getChildrenPhysicsRBDPropertiesAngularVelocity,
	getChildrenPhysicsRBDPropertiesIsMoving,
	getChildrenPhysicsRBDPropertiesIsSleeping,
	getChildrenPhysicsRBDPropertiesLinearDamping,
	getChildrenPhysicsRBDPropertiesLinearVelocity,
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
} from '../../../functions/_Physics';
import {playerPhysicsUpdate} from '../../../functions/_PlayerPhysics';
import {
	playerSimpleUpdate,
	getPlayerSimplePropertyOnGround,
	getPlayerSimplePropertyVelocity,
} from '../../../functions/_PlayerSimple';
import {
	sizzleVec3XY,
	sizzleVec3XZ,
	sizzleVec3YZ,
	sizzleVec4XYZ,
	sizzleVec4WArray,
	sizzleVec4XYZArray,
} from '../../../functions/_Sizzle';
import {trackFace, trackFaceGetLandmarks} from '../../../functions/_TrackingFace';
import {
	trackHand,
	trackHandGetNormalizedLandmarks,
	trackHandGetWorldLandmarks,
	getTrackedHandIndexDirection,
	getTrackedHandMiddleDirection,
	getTrackedHandPinkyDirection,
	getTrackedHandRingDirection,
	getTrackedHandThumbDirection,
} from '../../../functions/_TrackingHand';
import {
	setParamBoolean,
	setParamBooleanToggle,
	setParamColor,
	setParamFloat,
	setParamInteger,
	setParamString,
	setParamVector2,
	setParamVector3,
	setParamVector4,
	pressButtonParam,
} from '../../../functions/_Param';
import {planeSet, getPlaneNormal, getPlaneConstant} from '../../../functions/_Plane';
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
} from '../../../functions/_Ray';
import {
	objectDispatchEvent,
	getObjectLastDispatchedEventName,
	objectAddEventListeners,
} from '../../../functions/_ObjectDispatchEvent';
import {onPerformanceChange} from '../../../functions/_Performance';
import {
	SDFUnion,
	SDFSubtract,
	SDFIntersect,
	SDFSmoothUnion,
	SDFSmoothSubtract,
	SDFSmoothIntersect,
} from '../../../functions/_SDFOperations';
import {SDFRevolutionX, SDFRevolutionY, SDFRevolutionZ} from '../../../functions/_SDFOperations2D';
import {SDFBox, SDFSphere} from '../../../functions/_SDFPrimitives';
import {SDFRoundedX} from '../../../functions/_SDFPrimitives2D';
import {sleep} from '../../../functions/_Sleep';
import {sphereSet, getSphereCenter, getSphereRadius} from '../../../functions/_Sphere';
import {triggerFilter, triggerTwoWaySwitch} from '../../../functions/_Trigger';
import {vector3AngleTo, vector3Project, vector3ProjectOnPlane, vector3Unproject} from '../../../functions/_Vector';
import {crossVector2, crossVector3} from '../../../functions/_VectorCross';
import {distanceVector2, distanceVector3} from '../../../functions/_VectorDistance';
import {dotVector2, dotVector3} from '../../../functions/_VectorDot';
import {lengthVector, lengthVectorArray} from '../../../functions/_VectorLength';
import {manhattanDistanceVector2, manhattanDistanceVector3} from '../../../functions/_VectorManhattanDistance';
import {maxLengthVector2, maxLengthVector3, maxLengthVector4} from '../../../functions/_VectorMaxLength';
import {normalizeVector2, normalizeVector3, normalizeVector4} from '../../../functions/_VectorNormalize';
import {
	addVideoEventListener,
	getVideoPropertyCurrentTime,
	getVideoPropertyDuration,
	getVideoPropertyMuted,
	getVideoPropertyPlaying,
} from '../../../functions/_Video';
import {setViewer} from '../../../functions/_Viewer';
import {
	getWebXRARHitDetected,
	getWebXRARHitMatrix,
	getWebXRARHitPosition,
	getWebXRARHitQuaternion,
	getWebXRControllerObject,
	getWebXRControllerRay,
	getWebXRControllerHasLinearVelocity,
	getWebXRControllerLinearVelocity,
	getWebXRControllerHasAngularVelocity,
	getWebXRControllerAngularVelocity,
	getWebXRTrackedMarkerMatrix,
} from '../../../functions/_WebXR';
//
import {keyboardEventMatchesConfig} from '../../../functions/_KeyboardEventMatchesConfig';
import {getActorNodeParamValue} from '../../../functions/_GetActorNodeParamValue';
import {getChildrenAttributes} from '../../../functions/_GetChildrenAttributes';
import {getChildrenAttributesRef} from '../../../functions/_GetChildrenAttributesRef';
import {getChildrenAttributesPrevious} from '../../../functions/_GetChildrenAttributesPrevious';
import {getObject} from '../../../functions/_GetObject';
import {getObjectChild} from '../../../functions/_GetObjectChild';
import {getParent} from '../../../functions/_GetParent';
import {getObjectAttribute} from '../../../functions/_GetObjectAttribute';
import {getObjectAttributePrevious} from '../../../functions/_GetObjectAttributePrevious';
import {getObjectAttributeRef} from '../../../functions/_GetObjectAttributeRef';
import {getObjectHoveredIntersection, getObjectHoveredState} from '../../../functions/_GetObjectHoveredState';
import {
	getObjectProperty,
	getObjectWorldPosition,
	object3DLocalToWorld,
	object3DWorldToLocal,
	getChildrenPropertiesCastShadow,
	getChildrenPropertiesFrustumCulled,
	getChildrenPropertiesMatrixAutoUpdate,
	getChildrenPropertiesPosition,
	getChildrenPropertiesQuaternion,
	getChildrenPropertiesReceiveShadow,
	getChildrenPropertiesScale,
	getChildrenPropertiesUp,
	getChildrenPropertiesVisible,
} from '../../../functions/_GetObjectProperty';
import {getObjectUserData} from '../../../functions/_GetObjectUserData';
import {getSibbling} from '../../../functions/_GetSibbling';
import {setObjectAttribute} from '../../../functions/_SetObjectAttribute';
// import {setObjectAttributeRef} from '../../../functions/SetObjectAttributeRef';
import {setObjectLookAt} from '../../../functions/_SetObjectLookAt';
import {setObjectPolarTransform} from '../../../functions/_SetObjectPolarTransform';
import {setObjectPosition} from '../../../functions/_SetObjectPosition';
import {setObjectRotation} from '../../../functions/_SetObjectRotation';
import {
	setObjectCastShadow,
	setObjectFrustumCulled,
	setObjectMatrix,
	setObjectMatrixAutoUpdate,
	setObjectReceiveShadow,
	setObjectVisible,
	objectUpdateMatrix,
	objectUpdateWorldMatrix,
} from '../../../functions/_SetObjectProperty';
import {setObjectScale} from '../../../functions/_SetObjectScale';
import {PrimitiveArrayElement, VectorArrayElement} from '../../../nodes/utils/io/connections/Js';

export interface NamedFunctionMap {
	addNumber: addNumber;
	addVector: addVector<Vector2 | Vector3 | Vector4>;
	addVectorNumber: addVectorNumber<Vector2 | Vector3 | Vector4>;
	addAudioStopEventListener: addAudioStopEventListener;
	andArrays: andArrays;
	andBooleans: andBooleans;
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
	catmullRomCurve3GetPoint: catmullRomCurve3GetPoint;
	clamp: clamp;
	colorSetRGB: colorSetRGB;
	colorToVec3: colorToVec3;
	complement: complement;
	cookNode: cookNode;
	crossVector2: crossVector2;
	crossVector3: crossVector3;
	debug: debug<any>;
	distanceVector2: distanceVector2;
	distanceVector3: distanceVector3;
	divideNumber: divideNumber;
	divideVectorNumber: divideVectorNumber<Vector2 | Vector3 | Vector4>;
	dotVector2: dotVector2;
	dotVector3: dotVector3;
	easeI2: easeI2;
	easeO2: easeO2;
	easeIO2: easeIO2;
	easeI3: easeI3;
	easeO3: easeO3;
	easeIO3: easeIO3;
	easeI4: easeI4;
	easeO4: easeO4;
	easeIO4: easeIO4;
	easeSinI: easeSinI;
	easeSinO: easeSinO;
	easeSinIO: easeSinIO;
	easeElasticI: easeElasticI;
	easeElasticO: easeElasticO;
	easeElasticIO: easeElasticIO;
	elementsToArrayPrimitive: elementsToArrayPrimitive<PrimitiveArrayElement>;
	elementsToArrayVector: elementsToArrayVector<VectorArrayElement>;
	fit: fit;
	fitClamp: fitClamp;
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
	getChildrenAttributes: getChildrenAttributes;
	getChildrenAttributesRef: getChildrenAttributesRef;
	getChildrenAttributesPrevious: getChildrenAttributesPrevious;
	getChildrenPhysicsRBDPropertiesAngularDamping: getChildrenPhysicsRBDPropertiesAngularDamping;
	getChildrenPhysicsRBDPropertiesAngularVelocity: getChildrenPhysicsRBDPropertiesAngularVelocity;
	getChildrenPhysicsRBDPropertiesIsMoving: getChildrenPhysicsRBDPropertiesIsMoving;
	getChildrenPhysicsRBDPropertiesIsSleeping: getChildrenPhysicsRBDPropertiesIsSleeping;
	getChildrenPhysicsRBDPropertiesLinearDamping: getChildrenPhysicsRBDPropertiesLinearDamping;
	getChildrenPhysicsRBDPropertiesLinearVelocity: getChildrenPhysicsRBDPropertiesLinearVelocity;
	getChildrenPropertiesCastShadow: getChildrenPropertiesCastShadow;
	getChildrenPropertiesFrustumCulled: getChildrenPropertiesFrustumCulled;
	getChildrenPropertiesMatrixAutoUpdate: getChildrenPropertiesMatrixAutoUpdate;
	getChildrenPropertiesPosition: getChildrenPropertiesPosition;
	getChildrenPropertiesQuaternion: getChildrenPropertiesQuaternion;
	getChildrenPropertiesReceiveShadow: getChildrenPropertiesReceiveShadow;
	getChildrenPropertiesScale: getChildrenPropertiesScale;
	getChildrenPropertiesUp: getChildrenPropertiesUp;
	getChildrenPropertiesVisible: getChildrenPropertiesVisible;
	getDefaultCamera: getDefaultCamera;
	getIntersectionPropertyDistance: getIntersectionPropertyDistance;
	getIntersectionPropertyNormal: getIntersectionPropertyNormal;
	getIntersectionPropertyObject: getIntersectionPropertyObject;
	getIntersectionPropertyPoint: getIntersectionPropertyPoint;
	getIntersectionPropertyUv: getIntersectionPropertyUv;
	getMaterial: getMaterial;
	getObject: getObject;
	getObjectAttribute: getObjectAttribute;
	getObjectAttributePrevious: getObjectAttributePrevious;
	getObjectAttributeRef: getObjectAttributeRef;
	getObjectChild: getObjectChild;
	getObjectHoveredIntersection: getObjectHoveredIntersection;
	getObjectHoveredState: getObjectHoveredState;
	getObjectLastDispatchedEventName: getObjectLastDispatchedEventName;
	getObjectProperty: getObjectProperty;
	getObjectUserData: getObjectUserData;
	getObjectWorldPosition: getObjectWorldPosition;
	getParent: getParent;
	getPlaneNormal: getPlaneNormal;
	getPlaneConstant: getPlaneConstant;
	getPlayerInputDataLeft: getPlayerInputDataLeft;
	getPlayerInputDataRight: getPlayerInputDataRight;
	getPlayerInputDataBackward: getPlayerInputDataBackward;
	getPlayerInputDataForward: getPlayerInputDataForward;
	getPlayerInputDataJump: getPlayerInputDataJump;
	getPlayerInputDataRun: getPlayerInputDataRun;
	getPlayerSimplePropertyOnGround: getPlayerSimplePropertyOnGround;
	getPlayerSimplePropertyVelocity: getPlayerSimplePropertyVelocity;
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
	getSibbling: getSibbling;
	getSphereCenter: getSphereCenter;
	getSphereRadius: getSphereRadius;
	getTexture: getTexture;
	getTrackedHandIndexDirection: getTrackedHandIndexDirection;
	getTrackedHandMiddleDirection: getTrackedHandMiddleDirection;
	getTrackedHandPinkyDirection: getTrackedHandPinkyDirection;
	getTrackedHandRingDirection: getTrackedHandRingDirection;
	getTrackedHandThumbDirection: getTrackedHandThumbDirection;
	addVideoEventListener: addVideoEventListener;
	getVideoPropertyCurrentTime: getVideoPropertyCurrentTime;
	getVideoPropertyDuration: getVideoPropertyDuration;
	getVideoPropertyMuted: getVideoPropertyMuted;
	getVideoPropertyPlaying: getVideoPropertyPlaying;
	getWebXRARHitDetected: getWebXRARHitDetected;
	getWebXRARHitMatrix: getWebXRARHitMatrix;
	getWebXRARHitPosition: getWebXRARHitPosition;
	getWebXRARHitQuaternion: getWebXRARHitQuaternion;
	getWebXRControllerObject: getWebXRControllerObject;
	getWebXRControllerRay: getWebXRControllerRay;
	getWebXRControllerHasLinearVelocity: getWebXRControllerHasLinearVelocity;
	getWebXRControllerLinearVelocity: getWebXRControllerLinearVelocity;
	getWebXRControllerHasAngularVelocity: getWebXRControllerHasAngularVelocity;
	getWebXRControllerAngularVelocity: getWebXRControllerAngularVelocity;
	getWebXRTrackedMarkerMatrix: getWebXRTrackedMarkerMatrix;
	globalsTime: globalsTime;
	globalsTimeDelta: globalsTimeDelta;
	globalsRaycaster: globalsRaycaster;
	globalsRayFromCursor: globalsRayFromCursor;
	globalsCursor: globalsCursor;
	lengthVector: lengthVector<Vector2 | Vector3 | Vector4>;
	lengthVectorArray: lengthVectorArray<Vector2 | Vector3 | Vector4>;
	lerpColor: lerpColor;
	lerpNumber: lerpNumber;
	lerpQuaternion: lerpQuaternion;
	lerpVector2: lerpVector2;
	lerpVector3: lerpVector3;
	lerpVector4: lerpVector4;
	intToBool: intToBool;
	intToFloat: intToFloat;
	keyboardEventMatchesConfig: keyboardEventMatchesConfig;
	manhattanDistanceVector2: manhattanDistanceVector2;
	manhattanDistanceVector3: manhattanDistanceVector3;
	mathColor_1: mathColor_1;
	mathColor_2: mathColor_2;
	mathColor_3: mathColor_3;
	mathColor_3vvf: mathColor_3vvf;
	mathColor_4: mathColor_4;
	mathColor_5: mathColor_5;
	mathFloat_1: mathFloat_1;
	mathFloat_2: mathFloat_2;
	mathFloat_3: mathFloat_3;
	mathFloat_4: mathFloat_4;
	mathFloat_5: mathFloat_5;
	mathPrimArray_1: mathPrimArray_1;
	mathPrimArray_2: mathPrimArray_2;
	mathPrimArray_3: mathPrimArray_3;
	mathPrimArray_4: mathPrimArray_4;
	mathPrimArray_5: mathPrimArray_5;
	mathVector2_1: mathVector2_1;
	mathVector2_2: mathVector2_2;
	mathVector2_3: mathVector2_3;
	mathVector2_3vvf: mathVector2_3vvf;
	mathVector2_4: mathVector2_4;
	mathVector2_5: mathVector2_5;
	mathVector3_1: mathVector3_1;
	mathVector3_2: mathVector3_2;
	mathVector3_3: mathVector3_3;
	mathVector3_3vvf: mathVector3_3vvf;
	mathVector3_4: mathVector3_4;
	mathVector3_5: mathVector3_5;
	mathVector4_1: mathVector4_1;
	mathVector4_2: mathVector4_2;
	mathVector4_3: mathVector4_3;
	mathVector4_3vvf: mathVector4_3vvf;
	mathVector4_4: mathVector4_4;
	mathVector4_5: mathVector4_5;
	mathVectorArray_1: mathVectorArray_1<MathArrayVectorElement>;
	mathVectorArray_2: mathVectorArray_2<MathArrayVectorElement>;
	mathVectorArray_3: mathVectorArray_3<MathArrayVectorElement>;
	mathVectorArray_4: mathVectorArray_4<MathArrayVectorElement>;
	mathVectorArray_5: mathVectorArray_5<MathArrayVectorElement>;
	maxLengthVector2: maxLengthVector2;
	maxLengthVector3: maxLengthVector3;
	maxLengthVector4: maxLengthVector4;
	mix: mix;
	multNumber: multNumber;
	multScalarArrayVectorArray: multScalarArrayVectorArray<Vector2 | Vector3 | Vector4 | Color>;
	multScalarColor: multScalarColor;
	multScalarVector2: multScalarVector2;
	multScalarVector3: multScalarVector3;
	multScalarVector4: multScalarVector4;
	multScalarVectorArray: multScalarVectorArray<Vector2 | Vector3 | Vector4 | Color>;
	multVector: multVector<Vector2 | Vector3 | Vector4>;
	multVectorNumber: multVectorNumber<Vector2 | Vector3 | Vector4>;
	multAdd: multAdd;
	nearestPosition: nearestPosition;
	negate: negate<boolean | number>;
	normalizeVector2: normalizeVector2;
	normalizeVector3: normalizeVector3;
	normalizeVector4: normalizeVector4;
	object3DLocalToWorld: object3DLocalToWorld;
	object3DWorldToLocal: object3DWorldToLocal;
	objectAddEventListeners: objectAddEventListeners;
	objectDispatchEvent: objectDispatchEvent;
	objectUpdateMatrix: objectUpdateMatrix;
	objectUpdateWorldMatrix: objectUpdateWorldMatrix;
	onPerformanceChange: onPerformanceChange;
	orArrays: orArrays;
	orBooleans: orBooleans;
	particlesSystemReset: particlesSystemReset;
	particlesSystemStepSimulation: particlesSystemStepSimulation;
	pauseAudioSource: pauseAudioSource;
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
	playAnimation: playAnimation;
	playAudioSource: playAudioSource;
	playerPhysicsUpdate: playerPhysicsUpdate;
	playerSimpleUpdate: playerSimpleUpdate;
	playInstrumentNote: playInstrumentNote;
	rand: rand;
	random: random;
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
	setGeometryInstancePositions: setGeometryInstancePositions;
	setGeometryInstanceQuaternions: setGeometryInstanceQuaternions;
	setGeometryInstanceScales: setGeometryInstanceScales;
	setGeometryInstanceTransforms: setGeometryInstanceTransforms;
	setGeometryInstanceAttributeFloat: setGeometryInstanceAttributeFloat;
	setGeometryInstanceAttributeVector2: setGeometryInstanceAttributeVector2;
	setGeometryInstanceAttributeVector3: setGeometryInstanceAttributeVector3;
	setGeometryInstanceAttributeVector4: setGeometryInstanceAttributeVector4;
	setGeometryInstanceAttributeQuaternion: setGeometryInstanceAttributeQuaternion;
	setGeometryInstanceAttributeColor: setGeometryInstanceAttributeColor;
	setGeometryPositions: setGeometryPositions;
	setMaterialColor: setMaterialColor;
	setMaterialEmissiveColor: setMaterialEmissiveColor;
	setMaterialOpacity: setMaterialOpacity;
	setMaterialUniformNumber: setMaterialUniformNumber;
	setMaterialUniformVectorColor: setMaterialUniformVectorColor;
	setObjectAttribute: setObjectAttribute;
	// setObjectAttributeRef: setObjectAttributeRef;
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
	setParamBoolean: setParamBoolean;
	setParamBooleanToggle: setParamBooleanToggle;
	setParamColor: setParamColor;
	setParamFloat: setParamFloat;
	setParamInteger: setParamInteger;
	setParamString: setParamString;
	setParamVector2: setParamVector2;
	setParamVector3: setParamVector3;
	setParamVector4: setParamVector4;
	setViewer: setViewer;
	pressButtonParam: pressButtonParam;
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
	setPlayerInput: setPlayerInput;
	setSpotLightIntensity: setSpotLightIntensity;
	sizzleVec3XY: sizzleVec3XY;
	sizzleVec3XZ: sizzleVec3XZ;
	sizzleVec3YZ: sizzleVec3YZ;
	sizzleVec4XYZ: sizzleVec4XYZ;
	sizzleVec4WArray: sizzleVec4WArray;
	sizzleVec4XYZArray: sizzleVec4XYZArray;
	sleep: sleep;
	smoothstep: smoothstep;
	sphereSet: sphereSet;
	subtractNumber: subtractNumber;
	subtractVector: subtractVector<Vector2 | Vector3 | Vector4>;
	subtractVectorNumber: subtractVectorNumber<Vector2 | Vector3 | Vector4>;
	trackFace: trackFace;
	trackFaceGetLandmarks: trackFaceGetLandmarks;
	trackHand: trackHand;
	trackHandGetNormalizedLandmarks: trackHandGetNormalizedLandmarks;
	trackHandGetWorldLandmarks: trackHandGetWorldLandmarks;
	triggerFilter: triggerFilter;
	triggerTwoWaySwitch: triggerTwoWaySwitch;
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
			addVideoEventListener,
			addAudioStopEventListener,
			andArrays,
			andBooleans,
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
			clamp,
			colorSetRGB,
			colorToVec3,
			catmullRomCurve3GetPoint,
			complement,
			cookNode,
			crossVector2,
			crossVector3,
			debug,
			distanceVector2,
			distanceVector3,
			divideNumber,
			divideVectorNumber,
			dotVector2,
			dotVector3,
			easeI2,
			easeO2,
			easeIO2,
			easeI3,
			easeO3,
			easeIO3,
			easeI4,
			easeO4,
			easeIO4,
			easeSinI,
			easeSinO,
			easeSinIO,
			easeElasticI,
			easeElasticO,
			easeElasticIO,
			elementsToArrayPrimitive,
			elementsToArrayVector,
			fit,
			fitClamp,
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
			getChildrenAttributes,
			getChildrenAttributesRef,
			getChildrenAttributesPrevious,
			getChildrenPhysicsRBDPropertiesAngularDamping,
			getChildrenPhysicsRBDPropertiesAngularVelocity,
			getChildrenPhysicsRBDPropertiesIsMoving,
			getChildrenPhysicsRBDPropertiesIsSleeping,
			getChildrenPhysicsRBDPropertiesLinearDamping,
			getChildrenPhysicsRBDPropertiesLinearVelocity,
			getChildrenPropertiesCastShadow,
			getChildrenPropertiesFrustumCulled,
			getChildrenPropertiesMatrixAutoUpdate,
			getChildrenPropertiesPosition,
			getChildrenPropertiesQuaternion,
			getChildrenPropertiesReceiveShadow,
			getChildrenPropertiesScale,
			getChildrenPropertiesUp,
			getChildrenPropertiesVisible,
			getDefaultCamera,
			getIntersectionPropertyDistance,
			getIntersectionPropertyNormal,
			getIntersectionPropertyObject,
			getIntersectionPropertyPoint,
			getIntersectionPropertyUv,
			getMaterial,
			getObject,
			getObjectAttribute,
			getObjectAttributePrevious,
			getObjectAttributeRef,
			getObjectChild,
			getObjectHoveredIntersection,
			getObjectHoveredState,
			getObjectLastDispatchedEventName,
			getObjectProperty,
			getObjectUserData,
			getObjectWorldPosition,
			getParent,
			getPlaneNormal,
			getPlaneConstant,
			getPlayerSimplePropertyOnGround,
			getPlayerSimplePropertyVelocity,
			getPlayerInputDataLeft,
			getPlayerInputDataRight,
			getPlayerInputDataBackward,
			getPlayerInputDataForward,
			getPlayerInputDataJump,
			getPlayerInputDataRun,
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
			getSibbling,
			getSphereCenter,
			getSphereRadius,
			getTexture,
			getTrackedHandIndexDirection,
			getTrackedHandMiddleDirection,
			getTrackedHandPinkyDirection,
			getTrackedHandRingDirection,
			getTrackedHandThumbDirection,
			getVideoPropertyCurrentTime,
			getVideoPropertyDuration,
			getVideoPropertyMuted,
			getVideoPropertyPlaying,
			getWebXRARHitDetected,
			getWebXRARHitMatrix,
			getWebXRARHitPosition,
			getWebXRARHitQuaternion,
			getWebXRControllerObject,
			getWebXRControllerRay,
			getWebXRControllerHasLinearVelocity,
			getWebXRControllerLinearVelocity,
			getWebXRControllerHasAngularVelocity,
			getWebXRControllerAngularVelocity,
			getWebXRTrackedMarkerMatrix,
			globalsTime,
			globalsTimeDelta,
			globalsRaycaster,
			globalsRayFromCursor,
			globalsCursor,
			intToBool,
			intToFloat,
			keyboardEventMatchesConfig,
			lengthVector,
			lengthVectorArray,
			lerpColor,
			lerpNumber,
			lerpQuaternion,
			lerpVector2,
			lerpVector3,
			lerpVector4,
			manhattanDistanceVector2,
			manhattanDistanceVector3,
			mathColor_1,
			mathColor_2,
			mathColor_3,
			mathColor_3vvf,
			mathColor_4,
			mathColor_5,
			mathFloat_1,
			mathFloat_2,
			mathFloat_3,
			mathFloat_4,
			mathFloat_5,
			mathPrimArray_1,
			mathPrimArray_2,
			mathPrimArray_3,
			mathPrimArray_4,
			mathPrimArray_5,
			mathVector2_1,
			mathVector2_2,
			mathVector2_3,
			mathVector2_3vvf,
			mathVector2_4,
			mathVector2_5,
			mathVector3_1,
			mathVector3_2,
			mathVector3_3,
			mathVector3_3vvf,
			mathVector3_4,
			mathVector3_5,
			mathVector4_1,
			mathVector4_2,
			mathVector4_3,
			mathVector4_3vvf,
			mathVector4_4,
			mathVector4_5,
			mathVectorArray_1,
			mathVectorArray_2,
			mathVectorArray_3,
			mathVectorArray_4,
			mathVectorArray_5,
			maxLengthVector2,
			maxLengthVector3,
			maxLengthVector4,
			mix,
			multAdd,
			multNumber,
			multScalarArrayVectorArray,
			multScalarColor,
			multScalarVector2,
			multScalarVector3,
			multScalarVector4,
			multScalarVectorArray,
			multVector,
			multVectorNumber,
			nearestPosition,
			negate,
			normalizeVector2,
			normalizeVector3,
			normalizeVector4,
			object3DLocalToWorld,
			object3DWorldToLocal,
			objectAddEventListeners,
			objectDispatchEvent,
			objectUpdateMatrix,
			objectUpdateWorldMatrix,
			onPerformanceChange,
			orArrays,
			orBooleans,
			particlesSystemReset,
			particlesSystemStepSimulation,
			pauseAudioSource,
			planeSet,
			playAnimation,
			playAudioSource,
			playInstrumentNote,
			playerPhysicsUpdate,
			playerSimpleUpdate,
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
			pressButtonParam,
			rand,
			random,
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
			setGeometryInstancePositions,
			setGeometryInstanceQuaternions,
			setGeometryInstanceScales,
			setGeometryInstanceTransforms,
			setGeometryInstanceAttributeFloat,
			setGeometryInstanceAttributeVector2,
			setGeometryInstanceAttributeVector3,
			setGeometryInstanceAttributeVector4,
			setGeometryInstanceAttributeQuaternion,
			setGeometryInstanceAttributeColor,
			setGeometryPositions,
			setMaterialColor,
			setMaterialEmissiveColor,
			setMaterialOpacity,
			setMaterialUniformNumber,
			setMaterialUniformVectorColor,
			setObjectAttribute,
			// setObjectAttributeRef,
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
			setParamBoolean,
			setParamBooleanToggle,
			setParamColor,
			setParamFloat,
			setParamInteger,
			setParamString,
			setParamVector2,
			setParamVector3,
			setParamVector4,
			sleep,
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
			setPlayerInput,
			setSpotLightIntensity,
			setViewer,
			sizzleVec3XY,
			sizzleVec3XZ,
			sizzleVec3YZ,
			sizzleVec4XYZ,
			sizzleVec4WArray,
			sizzleVec4XYZArray,
			smoothstep,
			sphereSet,
			subtractNumber,
			subtractVector,
			subtractVectorNumber,
			trackFace,
			trackFaceGetLandmarks,
			trackHand,
			trackHandGetNormalizedLandmarks,
			trackHandGetWorldLandmarks,
			triggerFilter,
			triggerTwoWaySwitch,
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
