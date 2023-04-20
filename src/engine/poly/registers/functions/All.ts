import type { PolyEngine } from "../../../Poly";
import type { Color, Vector2, Vector3, Vector4 } from "three";
import type { PrimitiveArrayElement, VectorArrayElement } from "../../../nodes/utils/io/connections/Js";
import type { MathArrayVectorElement } from "../../../functions/_MathGeneric";
//

import { addAudioStopEventListener } from "../../../functions/addAudioStopEventListener";
import { addNumber } from "../../../functions/addNumber";
import { addVector } from "../../../functions/addVector";
import { addVectorNumber } from "../../../functions/addVectorNumber";
import { addVideoEventListener } from "../../../functions/addVideoEventListener";
import { andArrays } from "../../../functions/andArrays";
import { andBooleans } from "../../../functions/andBooleans";
import { animationActionCrossFade } from "../../../functions/animationActionCrossFade";
import { animationActionFadeIn } from "../../../functions/animationActionFadeIn";
import { animationActionFadeOut } from "../../../functions/animationActionFadeOut";
import { animationActionPlay } from "../../../functions/animationActionPlay";
import { animationActionStop } from "../../../functions/animationActionStop";
import { animationMixerUpdate } from "../../../functions/animationMixerUpdate";
import { arrayElementPrimitive } from "../../../functions/arrayElementPrimitive";
import { arrayElementVector } from "../../../functions/arrayElementVector";
import { arrayLength } from "../../../functions/arrayLength";
import { boolToInt } from "../../../functions/boolToInt";
import { box3Set } from "../../../functions/box3Set";
import { catmullRomCurve3GetPoint } from "../../../functions/catmullRomCurve3GetPoint";
import { clamp } from "../../../functions/clamp";
import { clothSolverReset } from "../../../functions/clothSolverReset";
import { clothSolverSetSelectedVertexIndex } from "../../../functions/clothSolverSetSelectedVertexIndex";
import { clothSolverSetSelectedVertexPosition } from "../../../functions/clothSolverSetSelectedVertexPosition";
import { clothSolverStepSimulation } from "../../../functions/clothSolverStepSimulation";
import { colorSetRGB } from "../../../functions/colorSetRGB";
import { colorToVec3 } from "../../../functions/colorToVec3";
import { complement } from "../../../functions/complement";
import { cookNode } from "../../../functions/cookNode";
import { crossVector2 } from "../../../functions/crossVector2";
import { crossVector3 } from "../../../functions/crossVector3";
import { debug } from "../../../functions/debug";
import { distanceVector2 } from "../../../functions/distanceVector2";
import { distanceVector3 } from "../../../functions/distanceVector3";
import { divideNumber } from "../../../functions/divideNumber";
import { divideVectorNumber } from "../../../functions/divideVectorNumber";
import { dotVector2 } from "../../../functions/dotVector2";
import { dotVector3 } from "../../../functions/dotVector3";
import { easeElasticI } from "../../../functions/easeElasticI";
import { easeElasticIO } from "../../../functions/easeElasticIO";
import { easeElasticO } from "../../../functions/easeElasticO";
import { easeI2 } from "../../../functions/easeI2";
import { easeI3 } from "../../../functions/easeI3";
import { easeI4 } from "../../../functions/easeI4";
import { easeIO2 } from "../../../functions/easeIO2";
import { easeIO3 } from "../../../functions/easeIO3";
import { easeIO4 } from "../../../functions/easeIO4";
import { easeO2 } from "../../../functions/easeO2";
import { easeO3 } from "../../../functions/easeO3";
import { easeO4 } from "../../../functions/easeO4";
import { easeSinI } from "../../../functions/easeSinI";
import { easeSinIO } from "../../../functions/easeSinIO";
import { easeSinO } from "../../../functions/easeSinO";
import { elementsToArrayPrimitive } from "../../../functions/elementsToArrayPrimitive";
import { elementsToArrayVector } from "../../../functions/elementsToArrayVector";
import { fit } from "../../../functions/fit";
import { fitClamp } from "../../../functions/fitClamp";
import { floatToColor } from "../../../functions/floatToColor";
import { floatToInt } from "../../../functions/floatToInt";
import { floatToVec2 } from "../../../functions/floatToVec2";
import { floatToVec3 } from "../../../functions/floatToVec3";
import { floatToVec4 } from "../../../functions/floatToVec4";
import { getActorNodeParamValue } from "../../../functions/getActorNodeParamValue";
import { getAnimationAction } from "../../../functions/getAnimationAction";
import { getAnimationMixer } from "../../../functions/getAnimationMixer";
import { getBox3Max } from "../../../functions/getBox3Max";
import { getBox3Min } from "../../../functions/getBox3Min";
import { getChildrenAttributes } from "../../../functions/getChildrenAttributes";
import { getChildrenAttributesPrevious } from "../../../functions/getChildrenAttributesPrevious";
import { getChildrenAttributesRef } from "../../../functions/getChildrenAttributesRef";
import { getChildrenPhysicsRBDPropertiesAngularDamping } from "../../../functions/getChildrenPhysicsRBDPropertiesAngularDamping";
import { getChildrenPhysicsRBDPropertiesAngularVelocity } from "../../../functions/getChildrenPhysicsRBDPropertiesAngularVelocity";
import { getChildrenPhysicsRBDPropertiesIsMoving } from "../../../functions/getChildrenPhysicsRBDPropertiesIsMoving";
import { getChildrenPhysicsRBDPropertiesIsSleeping } from "../../../functions/getChildrenPhysicsRBDPropertiesIsSleeping";
import { getChildrenPhysicsRBDPropertiesLinearDamping } from "../../../functions/getChildrenPhysicsRBDPropertiesLinearDamping";
import { getChildrenPhysicsRBDPropertiesLinearVelocity } from "../../../functions/getChildrenPhysicsRBDPropertiesLinearVelocity";
import { getChildrenPropertiesCastShadow } from "../../../functions/getChildrenPropertiesCastShadow";
import { getChildrenPropertiesFrustumCulled } from "../../../functions/getChildrenPropertiesFrustumCulled";
import { getChildrenPropertiesMatrixAutoUpdate } from "../../../functions/getChildrenPropertiesMatrixAutoUpdate";
import { getChildrenPropertiesPosition } from "../../../functions/getChildrenPropertiesPosition";
import { getChildrenPropertiesQuaternion } from "../../../functions/getChildrenPropertiesQuaternion";
import { getChildrenPropertiesReceiveShadow } from "../../../functions/getChildrenPropertiesReceiveShadow";
import { getChildrenPropertiesScale } from "../../../functions/getChildrenPropertiesScale";
import { getChildrenPropertiesUp } from "../../../functions/getChildrenPropertiesUp";
import { getChildrenPropertiesVisible } from "../../../functions/getChildrenPropertiesVisible";
import { getDefaultCamera } from "../../../functions/getDefaultCamera";
import { getIntersectionAttributeColorInterpolated } from "../../../functions/getIntersectionAttributeColorInterpolated";
import { getIntersectionAttributeColorNearest } from "../../../functions/getIntersectionAttributeColorNearest";
import { getIntersectionAttributeNumberInterpolated } from "../../../functions/getIntersectionAttributeNumberInterpolated";
import { getIntersectionAttributeNumberNearest } from "../../../functions/getIntersectionAttributeNumberNearest";
import { getIntersectionAttributeStringNearest } from "../../../functions/getIntersectionAttributeStringNearest";
import { getIntersectionAttributeVector2Interpolated } from "../../../functions/getIntersectionAttributeVector2Interpolated";
import { getIntersectionAttributeVector2Nearest } from "../../../functions/getIntersectionAttributeVector2Nearest";
import { getIntersectionAttributeVector3Interpolated } from "../../../functions/getIntersectionAttributeVector3Interpolated";
import { getIntersectionAttributeVector3Nearest } from "../../../functions/getIntersectionAttributeVector3Nearest";
import { getIntersectionAttributeVector4Interpolated } from "../../../functions/getIntersectionAttributeVector4Interpolated";
import { getIntersectionAttributeVector4Nearest } from "../../../functions/getIntersectionAttributeVector4Nearest";
import { getIntersectionPropertyDistance } from "../../../functions/getIntersectionPropertyDistance";
import { getIntersectionPropertyNormal } from "../../../functions/getIntersectionPropertyNormal";
import { getIntersectionPropertyObject } from "../../../functions/getIntersectionPropertyObject";
import { getIntersectionPropertyPoint } from "../../../functions/getIntersectionPropertyPoint";
import { getIntersectionPropertyUv } from "../../../functions/getIntersectionPropertyUv";
import { getMaterial } from "../../../functions/getMaterial";
import { getObject } from "../../../functions/getObject";
import { getObjectAttribute } from "../../../functions/getObjectAttribute";
import { getObjectAttributePrevious } from "../../../functions/getObjectAttributePrevious";
import { getObjectAttributeRef } from "../../../functions/getObjectAttributeRef";
import { getObjectChild } from "../../../functions/getObjectChild";
import { getObjectHoveredIntersection } from "../../../functions/getObjectHoveredIntersection";
import { getObjectHoveredState } from "../../../functions/getObjectHoveredState";
import { getObjectLastDispatchedEventName } from "../../../functions/getObjectLastDispatchedEventName";
import { getObjectProperty } from "../../../functions/getObjectProperty";
import { getObjectUserData } from "../../../functions/getObjectUserData";
import { getObjectWorldPosition } from "../../../functions/getObjectWorldPosition";
import { getParent } from "../../../functions/getParent";
import { getPhysicsRBDAngularDamping } from "../../../functions/getPhysicsRBDAngularDamping";
import { getPhysicsRBDAngularVelocity } from "../../../functions/getPhysicsRBDAngularVelocity";
import { getPhysicsRBDCapsuleHeight } from "../../../functions/getPhysicsRBDCapsuleHeight";
import { getPhysicsRBDCapsuleRadius } from "../../../functions/getPhysicsRBDCapsuleRadius";
import { getPhysicsRBDConeHeight } from "../../../functions/getPhysicsRBDConeHeight";
import { getPhysicsRBDConeRadius } from "../../../functions/getPhysicsRBDConeRadius";
import { getPhysicsRBDCuboidSizes } from "../../../functions/getPhysicsRBDCuboidSizes";
import { getPhysicsRBDCylinderHeight } from "../../../functions/getPhysicsRBDCylinderHeight";
import { getPhysicsRBDCylinderRadius } from "../../../functions/getPhysicsRBDCylinderRadius";
import { getPhysicsRBDIsMoving } from "../../../functions/getPhysicsRBDIsMoving";
import { getPhysicsRBDIsSleeping } from "../../../functions/getPhysicsRBDIsSleeping";
import { getPhysicsRBDLinearDamping } from "../../../functions/getPhysicsRBDLinearDamping";
import { getPhysicsRBDLinearVelocity } from "../../../functions/getPhysicsRBDLinearVelocity";
import { getPhysicsRBDSphereRadius } from "../../../functions/getPhysicsRBDSphereRadius";
import { getPlaneConstant } from "../../../functions/getPlaneConstant";
import { getPlaneNormal } from "../../../functions/getPlaneNormal";
import { getPlayerInputDataBackward } from "../../../functions/getPlayerInputDataBackward";
import { getPlayerInputDataForward } from "../../../functions/getPlayerInputDataForward";
import { getPlayerInputDataJump } from "../../../functions/getPlayerInputDataJump";
import { getPlayerInputDataLeft } from "../../../functions/getPlayerInputDataLeft";
import { getPlayerInputDataRight } from "../../../functions/getPlayerInputDataRight";
import { getPlayerInputDataRun } from "../../../functions/getPlayerInputDataRun";
import { getPlayerSimplePropertyOnGround } from "../../../functions/getPlayerSimplePropertyOnGround";
import { getPlayerSimplePropertyVelocity } from "../../../functions/getPlayerSimplePropertyVelocity";
import { getRayDirection } from "../../../functions/getRayDirection";
import { getRayOrigin } from "../../../functions/getRayOrigin";
import { getSibbling } from "../../../functions/getSibbling";
import { getSphereCenter } from "../../../functions/getSphereCenter";
import { getSphereRadius } from "../../../functions/getSphereRadius";
import { getTexture } from "../../../functions/getTexture";
import { getTrackedHandIndexDirection } from "../../../functions/getTrackedHandIndexDirection";
import { getTrackedHandMiddleDirection } from "../../../functions/getTrackedHandMiddleDirection";
import { getTrackedHandPinkyDirection } from "../../../functions/getTrackedHandPinkyDirection";
import { getTrackedHandRingDirection } from "../../../functions/getTrackedHandRingDirection";
import { getTrackedHandThumbDirection } from "../../../functions/getTrackedHandThumbDirection";
import { getVideoPropertyCurrentTime } from "../../../functions/getVideoPropertyCurrentTime";
import { getVideoPropertyDuration } from "../../../functions/getVideoPropertyDuration";
import { getVideoPropertyMuted } from "../../../functions/getVideoPropertyMuted";
import { getVideoPropertyPlaying } from "../../../functions/getVideoPropertyPlaying";
import { getWebXRARHitDetected } from "../../../functions/getWebXRARHitDetected";
import { getWebXRARHitMatrix } from "../../../functions/getWebXRARHitMatrix";
import { getWebXRARHitPosition } from "../../../functions/getWebXRARHitPosition";
import { getWebXRARHitQuaternion } from "../../../functions/getWebXRARHitQuaternion";
import { getWebXRControllerAngularVelocity } from "../../../functions/getWebXRControllerAngularVelocity";
import { getWebXRControllerHasAngularVelocity } from "../../../functions/getWebXRControllerHasAngularVelocity";
import { getWebXRControllerHasLinearVelocity } from "../../../functions/getWebXRControllerHasLinearVelocity";
import { getWebXRControllerLinearVelocity } from "../../../functions/getWebXRControllerLinearVelocity";
import { getWebXRControllerObject } from "../../../functions/getWebXRControllerObject";
import { getWebXRControllerRay } from "../../../functions/getWebXRControllerRay";
import { getWebXRTrackedMarkerMatrix } from "../../../functions/getWebXRTrackedMarkerMatrix";
import { globalsCursor } from "../../../functions/globalsCursor";
import { globalsRaycaster } from "../../../functions/globalsRaycaster";
import { globalsRayFromCursor } from "../../../functions/globalsRayFromCursor";
import { globalsTime } from "../../../functions/globalsTime";
import { globalsTimeDelta } from "../../../functions/globalsTimeDelta";
import { intToBool } from "../../../functions/intToBool";
import { intToFloat } from "../../../functions/intToFloat";
import { keyboardEventMatchesConfig } from "../../../functions/keyboardEventMatchesConfig";
import { lengthVector } from "../../../functions/lengthVector";
import { lengthVectorArray } from "../../../functions/lengthVectorArray";
import { lerpColor } from "../../../functions/lerpColor";
import { lerpNumber } from "../../../functions/lerpNumber";
import { lerpQuaternion } from "../../../functions/lerpQuaternion";
import { lerpVector2 } from "../../../functions/lerpVector2";
import { lerpVector3 } from "../../../functions/lerpVector3";
import { lerpVector4 } from "../../../functions/lerpVector4";
import { manhattanDistanceVector2 } from "../../../functions/manhattanDistanceVector2";
import { manhattanDistanceVector3 } from "../../../functions/manhattanDistanceVector3";
import { mathColor_1 } from "../../../functions/mathColor_1";
import { mathColor_2 } from "../../../functions/mathColor_2";
import { mathColor_3 } from "../../../functions/mathColor_3";
import { mathColor_3vvf } from "../../../functions/mathColor_3vvf";
import { mathColor_4 } from "../../../functions/mathColor_4";
import { mathColor_5 } from "../../../functions/mathColor_5";
import { mathFloat_1 } from "../../../functions/mathFloat_1";
import { mathFloat_2 } from "../../../functions/mathFloat_2";
import { mathFloat_3 } from "../../../functions/mathFloat_3";
import { mathFloat_4 } from "../../../functions/mathFloat_4";
import { mathFloat_5 } from "../../../functions/mathFloat_5";
import { mathPrimArray_1 } from "../../../functions/mathPrimArray_1";
import { mathPrimArray_2 } from "../../../functions/mathPrimArray_2";
import { mathPrimArray_3 } from "../../../functions/mathPrimArray_3";
import { mathPrimArray_4 } from "../../../functions/mathPrimArray_4";
import { mathPrimArray_5 } from "../../../functions/mathPrimArray_5";
import { mathVector2_1 } from "../../../functions/mathVector2_1";
import { mathVector2_2 } from "../../../functions/mathVector2_2";
import { mathVector2_3 } from "../../../functions/mathVector2_3";
import { mathVector2_3vvf } from "../../../functions/mathVector2_3vvf";
import { mathVector2_4 } from "../../../functions/mathVector2_4";
import { mathVector2_5 } from "../../../functions/mathVector2_5";
import { mathVector3_1 } from "../../../functions/mathVector3_1";
import { mathVector3_2 } from "../../../functions/mathVector3_2";
import { mathVector3_3 } from "../../../functions/mathVector3_3";
import { mathVector3_3vvf } from "../../../functions/mathVector3_3vvf";
import { mathVector3_4 } from "../../../functions/mathVector3_4";
import { mathVector3_5 } from "../../../functions/mathVector3_5";
import { mathVector4_1 } from "../../../functions/mathVector4_1";
import { mathVector4_2 } from "../../../functions/mathVector4_2";
import { mathVector4_3 } from "../../../functions/mathVector4_3";
import { mathVector4_3vvf } from "../../../functions/mathVector4_3vvf";
import { mathVector4_4 } from "../../../functions/mathVector4_4";
import { mathVector4_5 } from "../../../functions/mathVector4_5";
import { mathVectorArray_1 } from "../../../functions/mathVectorArray_1";
import { mathVectorArray_2 } from "../../../functions/mathVectorArray_2";
import { mathVectorArray_3 } from "../../../functions/mathVectorArray_3";
import { mathVectorArray_4 } from "../../../functions/mathVectorArray_4";
import { mathVectorArray_5 } from "../../../functions/mathVectorArray_5";
import { maxLengthVector2 } from "../../../functions/maxLengthVector2";
import { maxLengthVector3 } from "../../../functions/maxLengthVector3";
import { maxLengthVector4 } from "../../../functions/maxLengthVector4";
import { mix } from "../../../functions/mix";
import { multAdd } from "../../../functions/multAdd";
import { multNumber } from "../../../functions/multNumber";
import { multScalarArrayVectorArray } from "../../../functions/multScalarArrayVectorArray";
import { multScalarColor } from "../../../functions/multScalarColor";
import { multScalarVector2 } from "../../../functions/multScalarVector2";
import { multScalarVector3 } from "../../../functions/multScalarVector3";
import { multScalarVector4 } from "../../../functions/multScalarVector4";
import { multScalarVectorArray } from "../../../functions/multScalarVectorArray";
import { multVector } from "../../../functions/multVector";
import { multVectorNumber } from "../../../functions/multVectorNumber";
import { nearestPosition } from "../../../functions/nearestPosition";
import { negate } from "../../../functions/negate";
import { normalizeVector2 } from "../../../functions/normalizeVector2";
import { normalizeVector3 } from "../../../functions/normalizeVector3";
import { normalizeVector4 } from "../../../functions/normalizeVector4";
import { object3DLocalToWorld } from "../../../functions/object3DLocalToWorld";
import { object3DWorldToLocal } from "../../../functions/object3DWorldToLocal";
import { objectAddEventListeners } from "../../../functions/objectAddEventListeners";
import { objectDispatchEvent } from "../../../functions/objectDispatchEvent";
import { objectUpdateMatrix } from "../../../functions/objectUpdateMatrix";
import { objectUpdateWorldMatrix } from "../../../functions/objectUpdateWorldMatrix";
import { onPerformanceChange } from "../../../functions/onPerformanceChange";
import { orArrays } from "../../../functions/orArrays";
import { orBooleans } from "../../../functions/orBooleans";
import { particlesSystemReset } from "../../../functions/particlesSystemReset";
import { particlesSystemStepSimulation } from "../../../functions/particlesSystemStepSimulation";
import { pauseAudioSource } from "../../../functions/pauseAudioSource";
import { physicsRBDAddForce } from "../../../functions/physicsRBDAddForce";
import { physicsRBDAddForceAtPoint } from "../../../functions/physicsRBDAddForceAtPoint";
import { physicsRBDAddTorque } from "../../../functions/physicsRBDAddTorque";
import { physicsRBDApplyImpulse } from "../../../functions/physicsRBDApplyImpulse";
import { physicsRBDApplyImpulseAtPoint } from "../../../functions/physicsRBDApplyImpulseAtPoint";
import { physicsRBDApplyTorqueImpulse } from "../../../functions/physicsRBDApplyTorqueImpulse";
import { physicsRBDRemove } from "../../../functions/physicsRBDRemove";
import { physicsRBDResetAll } from "../../../functions/physicsRBDResetAll";
import { physicsRBDResetForces } from "../../../functions/physicsRBDResetForces";
import { physicsRBDResetTorques } from "../../../functions/physicsRBDResetTorques";
import { physicsWorldReset } from "../../../functions/physicsWorldReset";
import { physicsWorldStepSimulation } from "../../../functions/physicsWorldStepSimulation";
import { planeSet } from "../../../functions/planeSet";
import { playAnimation } from "../../../functions/playAnimation";
import { playAudioSource } from "../../../functions/playAudioSource";
import { playerPhysicsUpdate } from "../../../functions/playerPhysicsUpdate";
import { playerSimpleUpdate } from "../../../functions/playerSimpleUpdate";
import { playInstrumentNote } from "../../../functions/playInstrumentNote";
import { pressButtonParam } from "../../../functions/pressButtonParam";
import { previousValueColor } from "../../../functions/previousValueColor";
import { previousValuePrimitive } from "../../../functions/previousValuePrimitive";
import { previousValueVector2 } from "../../../functions/previousValueVector2";
import { previousValueVector3 } from "../../../functions/previousValueVector3";
import { previousValueVector4 } from "../../../functions/previousValueVector4";
import { rand } from "../../../functions/rand";
import { random } from "../../../functions/random";
import { rayDistanceToPlane } from "../../../functions/rayDistanceToPlane";
import { rayFromCamera } from "../../../functions/rayFromCamera";
import { rayIntersectBox3 } from "../../../functions/rayIntersectBox3";
import { rayIntersectObject3D } from "../../../functions/rayIntersectObject3D";
import { rayIntersectPlane } from "../../../functions/rayIntersectPlane";
import { rayIntersectsBox3 } from "../../../functions/rayIntersectsBox3";
import { rayIntersectsObject3D } from "../../../functions/rayIntersectsObject3D";
import { rayIntersectSphere } from "../../../functions/rayIntersectSphere";
import { rayIntersectsPlane } from "../../../functions/rayIntersectsPlane";
import { rayIntersectsSphere } from "../../../functions/rayIntersectsSphere";
import { raySet } from "../../../functions/raySet";
import { SDFBox } from "../../../functions/SDFBox";
import { SDFIntersect } from "../../../functions/SDFIntersect";
import { SDFRevolutionX } from "../../../functions/SDFRevolutionX";
import { SDFRevolutionY } from "../../../functions/SDFRevolutionY";
import { SDFRevolutionZ } from "../../../functions/SDFRevolutionZ";
import { SDFRoundedX } from "../../../functions/SDFRoundedX";
import { SDFSmoothIntersect } from "../../../functions/SDFSmoothIntersect";
import { SDFSmoothSubtract } from "../../../functions/SDFSmoothSubtract";
import { SDFSmoothUnion } from "../../../functions/SDFSmoothUnion";
import { SDFSphere } from "../../../functions/SDFSphere";
import { SDFSubtract } from "../../../functions/SDFSubtract";
import { SDFUnion } from "../../../functions/SDFUnion";
import { setGeometryInstanceAttributeColor } from "../../../functions/setGeometryInstanceAttributeColor";
import { setGeometryInstanceAttributeFloat } from "../../../functions/setGeometryInstanceAttributeFloat";
import { setGeometryInstanceAttributeQuaternion } from "../../../functions/setGeometryInstanceAttributeQuaternion";
import { setGeometryInstanceAttributeVector2 } from "../../../functions/setGeometryInstanceAttributeVector2";
import { setGeometryInstanceAttributeVector3 } from "../../../functions/setGeometryInstanceAttributeVector3";
import { setGeometryInstanceAttributeVector4 } from "../../../functions/setGeometryInstanceAttributeVector4";
import { setGeometryInstancePositions } from "../../../functions/setGeometryInstancePositions";
import { setGeometryInstanceQuaternions } from "../../../functions/setGeometryInstanceQuaternions";
import { setGeometryInstanceScales } from "../../../functions/setGeometryInstanceScales";
import { setGeometryInstanceTransforms } from "../../../functions/setGeometryInstanceTransforms";
import { setGeometryPositions } from "../../../functions/setGeometryPositions";
import { setMaterialColor } from "../../../functions/setMaterialColor";
import { setMaterialEmissiveColor } from "../../../functions/setMaterialEmissiveColor";
import { setMaterialOpacity } from "../../../functions/setMaterialOpacity";
import { setMaterialUniformNumber } from "../../../functions/setMaterialUniformNumber";
import { setMaterialUniformVectorColor } from "../../../functions/setMaterialUniformVectorColor";
import { setObjectAttribute } from "../../../functions/setObjectAttribute";
import { setObjectCastShadow } from "../../../functions/setObjectCastShadow";
import { setObjectFrustumCulled } from "../../../functions/setObjectFrustumCulled";
import { setObjectLookAt } from "../../../functions/setObjectLookAt";
import { setObjectMaterial } from "../../../functions/setObjectMaterial";
import { setObjectMaterialColor } from "../../../functions/setObjectMaterialColor";
import { setObjectMatrix } from "../../../functions/setObjectMatrix";
import { setObjectMatrixAutoUpdate } from "../../../functions/setObjectMatrixAutoUpdate";
import { setObjectPolarTransform } from "../../../functions/setObjectPolarTransform";
import { setObjectPosition } from "../../../functions/setObjectPosition";
import { setObjectReceiveShadow } from "../../../functions/setObjectReceiveShadow";
import { setObjectRotation } from "../../../functions/setObjectRotation";
import { setObjectScale } from "../../../functions/setObjectScale";
import { setObjectVisible } from "../../../functions/setObjectVisible";
import { setParamBoolean } from "../../../functions/setParamBoolean";
import { setParamBooleanToggle } from "../../../functions/setParamBooleanToggle";
import { setParamColor } from "../../../functions/setParamColor";
import { setParamFloat } from "../../../functions/setParamFloat";
import { setParamInteger } from "../../../functions/setParamInteger";
import { setParamString } from "../../../functions/setParamString";
import { setParamVector2 } from "../../../functions/setParamVector2";
import { setParamVector3 } from "../../../functions/setParamVector3";
import { setParamVector4 } from "../../../functions/setParamVector4";
import { setPerspectiveCameraFov } from "../../../functions/setPerspectiveCameraFov";
import { setPerspectiveCameraNearFar } from "../../../functions/setPerspectiveCameraNearFar";
import { setPhysicsRBDAngularVelocity } from "../../../functions/setPhysicsRBDAngularVelocity";
import { setPhysicsRBDCapsuleProperty } from "../../../functions/setPhysicsRBDCapsuleProperty";
import { setPhysicsRBDConeProperty } from "../../../functions/setPhysicsRBDConeProperty";
import { setPhysicsRBDCuboidProperty } from "../../../functions/setPhysicsRBDCuboidProperty";
import { setPhysicsRBDCylinderProperty } from "../../../functions/setPhysicsRBDCylinderProperty";
import { setPhysicsRBDLinearVelocity } from "../../../functions/setPhysicsRBDLinearVelocity";
import { setPhysicsRBDPosition } from "../../../functions/setPhysicsRBDPosition";
import { setPhysicsRBDRotation } from "../../../functions/setPhysicsRBDRotation";
import { setPhysicsRBDSphereProperty } from "../../../functions/setPhysicsRBDSphereProperty";
import { setPhysicsWorldGravity } from "../../../functions/setPhysicsWorldGravity";
import { setPlayerInput } from "../../../functions/setPlayerInput";
import { setSpotLightIntensity } from "../../../functions/setSpotLightIntensity";
import { setViewer } from "../../../functions/setViewer";
import { sizzleVec3XY } from "../../../functions/sizzleVec3XY";
import { sizzleVec3XZ } from "../../../functions/sizzleVec3XZ";
import { sizzleVec3YZ } from "../../../functions/sizzleVec3YZ";
import { sizzleVec4WArray } from "../../../functions/sizzleVec4WArray";
import { sizzleVec4XYZ } from "../../../functions/sizzleVec4XYZ";
import { sizzleVec4XYZArray } from "../../../functions/sizzleVec4XYZArray";
import { sleep } from "../../../functions/sleep";
import { smoothstep } from "../../../functions/smoothstep";
import { sphereSet } from "../../../functions/sphereSet";
import { subtractNumber } from "../../../functions/subtractNumber";
import { subtractVector } from "../../../functions/subtractVector";
import { subtractVectorNumber } from "../../../functions/subtractVectorNumber";
import { trackFace } from "../../../functions/trackFace";
import { trackFaceGetLandmarks } from "../../../functions/trackFaceGetLandmarks";
import { trackHand } from "../../../functions/trackHand";
import { trackHandGetNormalizedLandmarks } from "../../../functions/trackHandGetNormalizedLandmarks";
import { trackHandGetWorldLandmarks } from "../../../functions/trackHandGetWorldLandmarks";
import { triggerFilter } from "../../../functions/triggerFilter";
import { triggerTwoWaySwitch } from "../../../functions/triggerTwoWaySwitch";
import { vec2ToVec3 } from "../../../functions/vec2ToVec3";
import { vec3ToColor } from "../../../functions/vec3ToColor";
import { vec3ToVec4 } from "../../../functions/vec3ToVec4";
import { vector3AngleTo } from "../../../functions/vector3AngleTo";
import { vector3Project } from "../../../functions/vector3Project";
import { vector3ProjectOnPlane } from "../../../functions/vector3ProjectOnPlane";
import { vector3Unproject } from "../../../functions/vector3Unproject";

export interface NamedFunctionMap {
  addAudioStopEventListener: addAudioStopEventListener;
  addNumber: addNumber;
  addVector: addVector<Vector2 | Vector3 | Vector4>;
  addVectorNumber: addVectorNumber<Vector2 | Vector3 | Vector4>;
  addVideoEventListener: addVideoEventListener;
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
  clothSolverReset: clothSolverReset;
  clothSolverSetSelectedVertexIndex: clothSolverSetSelectedVertexIndex;
  clothSolverSetSelectedVertexPosition: clothSolverSetSelectedVertexPosition;
  clothSolverStepSimulation: clothSolverStepSimulation;
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
  easeElasticI: easeElasticI;
  easeElasticIO: easeElasticIO;
  easeElasticO: easeElasticO;
  easeI2: easeI2;
  easeI3: easeI3;
  easeI4: easeI4;
  easeIO2: easeIO2;
  easeIO3: easeIO3;
  easeIO4: easeIO4;
  easeO2: easeO2;
  easeO3: easeO3;
  easeO4: easeO4;
  easeSinI: easeSinI;
  easeSinIO: easeSinIO;
  easeSinO: easeSinO;
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
  getBox3Max: getBox3Max;
  getBox3Min: getBox3Min;
  getChildrenAttributes: getChildrenAttributes;
  getChildrenAttributesPrevious: getChildrenAttributesPrevious;
  getChildrenAttributesRef: getChildrenAttributesRef;
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
  getIntersectionAttributeColorInterpolated: getIntersectionAttributeColorInterpolated;
  getIntersectionAttributeColorNearest: getIntersectionAttributeColorNearest;
  getIntersectionAttributeNumberInterpolated: getIntersectionAttributeNumberInterpolated;
  getIntersectionAttributeNumberNearest: getIntersectionAttributeNumberNearest;
  getIntersectionAttributeStringNearest: getIntersectionAttributeStringNearest;
  getIntersectionAttributeVector2Interpolated: getIntersectionAttributeVector2Interpolated;
  getIntersectionAttributeVector2Nearest: getIntersectionAttributeVector2Nearest;
  getIntersectionAttributeVector3Interpolated: getIntersectionAttributeVector3Interpolated;
  getIntersectionAttributeVector3Nearest: getIntersectionAttributeVector3Nearest;
  getIntersectionAttributeVector4Interpolated: getIntersectionAttributeVector4Interpolated;
  getIntersectionAttributeVector4Nearest: getIntersectionAttributeVector4Nearest;
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
  getPhysicsRBDAngularDamping: getPhysicsRBDAngularDamping;
  getPhysicsRBDAngularVelocity: getPhysicsRBDAngularVelocity;
  getPhysicsRBDCapsuleHeight: getPhysicsRBDCapsuleHeight;
  getPhysicsRBDCapsuleRadius: getPhysicsRBDCapsuleRadius;
  getPhysicsRBDConeHeight: getPhysicsRBDConeHeight;
  getPhysicsRBDConeRadius: getPhysicsRBDConeRadius;
  getPhysicsRBDCuboidSizes: getPhysicsRBDCuboidSizes;
  getPhysicsRBDCylinderHeight: getPhysicsRBDCylinderHeight;
  getPhysicsRBDCylinderRadius: getPhysicsRBDCylinderRadius;
  getPhysicsRBDIsMoving: getPhysicsRBDIsMoving;
  getPhysicsRBDIsSleeping: getPhysicsRBDIsSleeping;
  getPhysicsRBDLinearDamping: getPhysicsRBDLinearDamping;
  getPhysicsRBDLinearVelocity: getPhysicsRBDLinearVelocity;
  getPhysicsRBDSphereRadius: getPhysicsRBDSphereRadius;
  getPlaneConstant: getPlaneConstant;
  getPlaneNormal: getPlaneNormal;
  getPlayerInputDataBackward: getPlayerInputDataBackward;
  getPlayerInputDataForward: getPlayerInputDataForward;
  getPlayerInputDataJump: getPlayerInputDataJump;
  getPlayerInputDataLeft: getPlayerInputDataLeft;
  getPlayerInputDataRight: getPlayerInputDataRight;
  getPlayerInputDataRun: getPlayerInputDataRun;
  getPlayerSimplePropertyOnGround: getPlayerSimplePropertyOnGround;
  getPlayerSimplePropertyVelocity: getPlayerSimplePropertyVelocity;
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
  getVideoPropertyCurrentTime: getVideoPropertyCurrentTime;
  getVideoPropertyDuration: getVideoPropertyDuration;
  getVideoPropertyMuted: getVideoPropertyMuted;
  getVideoPropertyPlaying: getVideoPropertyPlaying;
  getWebXRARHitDetected: getWebXRARHitDetected;
  getWebXRARHitMatrix: getWebXRARHitMatrix;
  getWebXRARHitPosition: getWebXRARHitPosition;
  getWebXRARHitQuaternion: getWebXRARHitQuaternion;
  getWebXRControllerAngularVelocity: getWebXRControllerAngularVelocity;
  getWebXRControllerHasAngularVelocity: getWebXRControllerHasAngularVelocity;
  getWebXRControllerHasLinearVelocity: getWebXRControllerHasLinearVelocity;
  getWebXRControllerLinearVelocity: getWebXRControllerLinearVelocity;
  getWebXRControllerObject: getWebXRControllerObject;
  getWebXRControllerRay: getWebXRControllerRay;
  getWebXRTrackedMarkerMatrix: getWebXRTrackedMarkerMatrix;
  globalsCursor: globalsCursor;
  globalsRaycaster: globalsRaycaster;
  globalsRayFromCursor: globalsRayFromCursor;
  globalsTime: globalsTime;
  globalsTimeDelta: globalsTimeDelta;
  intToBool: intToBool;
  intToFloat: intToFloat;
  keyboardEventMatchesConfig: keyboardEventMatchesConfig;
  lengthVector: lengthVector<Vector2 | Vector3 | Vector4>;
  lengthVectorArray: lengthVectorArray<Vector2 | Vector3 | Vector4>;
  lerpColor: lerpColor;
  lerpNumber: lerpNumber;
  lerpQuaternion: lerpQuaternion;
  lerpVector2: lerpVector2;
  lerpVector3: lerpVector3;
  lerpVector4: lerpVector4;
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
  multAdd: multAdd;
  multNumber: multNumber;
  multScalarArrayVectorArray: multScalarArrayVectorArray<Color | Vector2 | Vector3 | Vector4>;
  multScalarColor: multScalarColor;
  multScalarVector2: multScalarVector2;
  multScalarVector3: multScalarVector3;
  multScalarVector4: multScalarVector4;
  multScalarVectorArray: multScalarVectorArray<Color | Vector2 | Vector3 | Vector4>;
  multVector: multVector<Vector2 | Vector3 | Vector4>;
  multVectorNumber: multVectorNumber<Vector2 | Vector3 | Vector4>;
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
  pressButtonParam: pressButtonParam;
  previousValueColor: previousValueColor;
  previousValuePrimitive: previousValuePrimitive<boolean | number | string>;
  previousValueVector2: previousValueVector2;
  previousValueVector3: previousValueVector3;
  previousValueVector4: previousValueVector4;
  rand: rand;
  random: random;
  rayDistanceToPlane: rayDistanceToPlane;
  rayFromCamera: rayFromCamera;
  rayIntersectBox3: rayIntersectBox3;
  rayIntersectObject3D: rayIntersectObject3D;
  rayIntersectPlane: rayIntersectPlane;
  rayIntersectsBox3: rayIntersectsBox3;
  rayIntersectsObject3D: rayIntersectsObject3D;
  rayIntersectSphere: rayIntersectSphere;
  rayIntersectsPlane: rayIntersectsPlane;
  rayIntersectsSphere: rayIntersectsSphere;
  raySet: raySet;
  SDFBox: SDFBox;
  SDFIntersect: SDFIntersect;
  SDFRevolutionX: SDFRevolutionX;
  SDFRevolutionY: SDFRevolutionY;
  SDFRevolutionZ: SDFRevolutionZ;
  SDFRoundedX: SDFRoundedX;
  SDFSmoothIntersect: SDFSmoothIntersect;
  SDFSmoothSubtract: SDFSmoothSubtract;
  SDFSmoothUnion: SDFSmoothUnion;
  SDFSphere: SDFSphere;
  SDFSubtract: SDFSubtract;
  SDFUnion: SDFUnion;
  setGeometryInstanceAttributeColor: setGeometryInstanceAttributeColor;
  setGeometryInstanceAttributeFloat: setGeometryInstanceAttributeFloat;
  setGeometryInstanceAttributeQuaternion: setGeometryInstanceAttributeQuaternion;
  setGeometryInstanceAttributeVector2: setGeometryInstanceAttributeVector2;
  setGeometryInstanceAttributeVector3: setGeometryInstanceAttributeVector3;
  setGeometryInstanceAttributeVector4: setGeometryInstanceAttributeVector4;
  setGeometryInstancePositions: setGeometryInstancePositions;
  setGeometryInstanceQuaternions: setGeometryInstanceQuaternions;
  setGeometryInstanceScales: setGeometryInstanceScales;
  setGeometryInstanceTransforms: setGeometryInstanceTransforms;
  setGeometryPositions: setGeometryPositions;
  setMaterialColor: setMaterialColor;
  setMaterialEmissiveColor: setMaterialEmissiveColor;
  setMaterialOpacity: setMaterialOpacity;
  setMaterialUniformNumber: setMaterialUniformNumber;
  setMaterialUniformVectorColor: setMaterialUniformVectorColor;
  setObjectAttribute: setObjectAttribute;
  setObjectCastShadow: setObjectCastShadow;
  setObjectFrustumCulled: setObjectFrustumCulled;
  setObjectLookAt: setObjectLookAt;
  setObjectMaterial: setObjectMaterial;
  setObjectMaterialColor: setObjectMaterialColor;
  setObjectMatrix: setObjectMatrix;
  setObjectMatrixAutoUpdate: setObjectMatrixAutoUpdate;
  setObjectPolarTransform: setObjectPolarTransform;
  setObjectPosition: setObjectPosition;
  setObjectReceiveShadow: setObjectReceiveShadow;
  setObjectRotation: setObjectRotation;
  setObjectScale: setObjectScale;
  setObjectVisible: setObjectVisible;
  setParamBoolean: setParamBoolean;
  setParamBooleanToggle: setParamBooleanToggle;
  setParamColor: setParamColor;
  setParamFloat: setParamFloat;
  setParamInteger: setParamInteger;
  setParamString: setParamString;
  setParamVector2: setParamVector2;
  setParamVector3: setParamVector3;
  setParamVector4: setParamVector4;
  setPerspectiveCameraFov: setPerspectiveCameraFov;
  setPerspectiveCameraNearFar: setPerspectiveCameraNearFar;
  setPhysicsRBDAngularVelocity: setPhysicsRBDAngularVelocity;
  setPhysicsRBDCapsuleProperty: setPhysicsRBDCapsuleProperty;
  setPhysicsRBDConeProperty: setPhysicsRBDConeProperty;
  setPhysicsRBDCuboidProperty: setPhysicsRBDCuboidProperty;
  setPhysicsRBDCylinderProperty: setPhysicsRBDCylinderProperty;
  setPhysicsRBDLinearVelocity: setPhysicsRBDLinearVelocity;
  setPhysicsRBDPosition: setPhysicsRBDPosition;
  setPhysicsRBDRotation: setPhysicsRBDRotation;
  setPhysicsRBDSphereProperty: setPhysicsRBDSphereProperty;
  setPhysicsWorldGravity: setPhysicsWorldGravity;
  setPlayerInput: setPlayerInput;
  setSpotLightIntensity: setSpotLightIntensity;
  setViewer: setViewer;
  sizzleVec3XY: sizzleVec3XY;
  sizzleVec3XZ: sizzleVec3XZ;
  sizzleVec3YZ: sizzleVec3YZ;
  sizzleVec4WArray: sizzleVec4WArray;
  sizzleVec4XYZ: sizzleVec4XYZ;
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
  vec2ToVec3: vec2ToVec3;
  vec3ToColor: vec3ToColor;
  vec3ToVec4: vec3ToVec4;
  vector3AngleTo: vector3AngleTo;
  vector3Project: vector3Project;
  vector3ProjectOnPlane: vector3ProjectOnPlane;
  vector3Unproject: vector3Unproject;
}

export class AllNamedFunctionRegister {
  static run(poly: PolyEngine) {
    [
      addAudioStopEventListener,
      addNumber,
      addVector,
      addVectorNumber,
      addVideoEventListener,
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
      catmullRomCurve3GetPoint,
      clamp,
      clothSolverReset,
      clothSolverSetSelectedVertexIndex,
      clothSolverSetSelectedVertexPosition,
      clothSolverStepSimulation,
      colorSetRGB,
      colorToVec3,
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
      easeElasticI,
      easeElasticIO,
      easeElasticO,
      easeI2,
      easeI3,
      easeI4,
      easeIO2,
      easeIO3,
      easeIO4,
      easeO2,
      easeO3,
      easeO4,
      easeSinI,
      easeSinIO,
      easeSinO,
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
      getBox3Max,
      getBox3Min,
      getChildrenAttributes,
      getChildrenAttributesPrevious,
      getChildrenAttributesRef,
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
      getIntersectionAttributeColorInterpolated,
      getIntersectionAttributeColorNearest,
      getIntersectionAttributeNumberInterpolated,
      getIntersectionAttributeNumberNearest,
      getIntersectionAttributeStringNearest,
      getIntersectionAttributeVector2Interpolated,
      getIntersectionAttributeVector2Nearest,
      getIntersectionAttributeVector3Interpolated,
      getIntersectionAttributeVector3Nearest,
      getIntersectionAttributeVector4Interpolated,
      getIntersectionAttributeVector4Nearest,
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
      getPhysicsRBDAngularDamping,
      getPhysicsRBDAngularVelocity,
      getPhysicsRBDCapsuleHeight,
      getPhysicsRBDCapsuleRadius,
      getPhysicsRBDConeHeight,
      getPhysicsRBDConeRadius,
      getPhysicsRBDCuboidSizes,
      getPhysicsRBDCylinderHeight,
      getPhysicsRBDCylinderRadius,
      getPhysicsRBDIsMoving,
      getPhysicsRBDIsSleeping,
      getPhysicsRBDLinearDamping,
      getPhysicsRBDLinearVelocity,
      getPhysicsRBDSphereRadius,
      getPlaneConstant,
      getPlaneNormal,
      getPlayerInputDataBackward,
      getPlayerInputDataForward,
      getPlayerInputDataJump,
      getPlayerInputDataLeft,
      getPlayerInputDataRight,
      getPlayerInputDataRun,
      getPlayerSimplePropertyOnGround,
      getPlayerSimplePropertyVelocity,
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
      getWebXRControllerAngularVelocity,
      getWebXRControllerHasAngularVelocity,
      getWebXRControllerHasLinearVelocity,
      getWebXRControllerLinearVelocity,
      getWebXRControllerObject,
      getWebXRControllerRay,
      getWebXRTrackedMarkerMatrix,
      globalsCursor,
      globalsRaycaster,
      globalsRayFromCursor,
      globalsTime,
      globalsTimeDelta,
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
      planeSet,
      playAnimation,
      playAudioSource,
      playerPhysicsUpdate,
      playerSimpleUpdate,
      playInstrumentNote,
      pressButtonParam,
      previousValueColor,
      previousValuePrimitive,
      previousValueVector2,
      previousValueVector3,
      previousValueVector4,
      rand,
      random,
      rayDistanceToPlane,
      rayFromCamera,
      rayIntersectBox3,
      rayIntersectObject3D,
      rayIntersectPlane,
      rayIntersectsBox3,
      rayIntersectsObject3D,
      rayIntersectSphere,
      rayIntersectsPlane,
      rayIntersectsSphere,
      raySet,
      SDFBox,
      SDFIntersect,
      SDFRevolutionX,
      SDFRevolutionY,
      SDFRevolutionZ,
      SDFRoundedX,
      SDFSmoothIntersect,
      SDFSmoothSubtract,
      SDFSmoothUnion,
      SDFSphere,
      SDFSubtract,
      SDFUnion,
      setGeometryInstanceAttributeColor,
      setGeometryInstanceAttributeFloat,
      setGeometryInstanceAttributeQuaternion,
      setGeometryInstanceAttributeVector2,
      setGeometryInstanceAttributeVector3,
      setGeometryInstanceAttributeVector4,
      setGeometryInstancePositions,
      setGeometryInstanceQuaternions,
      setGeometryInstanceScales,
      setGeometryInstanceTransforms,
      setGeometryPositions,
      setMaterialColor,
      setMaterialEmissiveColor,
      setMaterialOpacity,
      setMaterialUniformNumber,
      setMaterialUniformVectorColor,
      setObjectAttribute,
      setObjectCastShadow,
      setObjectFrustumCulled,
      setObjectLookAt,
      setObjectMaterial,
      setObjectMaterialColor,
      setObjectMatrix,
      setObjectMatrixAutoUpdate,
      setObjectPolarTransform,
      setObjectPosition,
      setObjectReceiveShadow,
      setObjectRotation,
      setObjectScale,
      setObjectVisible,
      setParamBoolean,
      setParamBooleanToggle,
      setParamColor,
      setParamFloat,
      setParamInteger,
      setParamString,
      setParamVector2,
      setParamVector3,
      setParamVector4,
      setPerspectiveCameraFov,
      setPerspectiveCameraNearFar,
      setPhysicsRBDAngularVelocity,
      setPhysicsRBDCapsuleProperty,
      setPhysicsRBDConeProperty,
      setPhysicsRBDCuboidProperty,
      setPhysicsRBDCylinderProperty,
      setPhysicsRBDLinearVelocity,
      setPhysicsRBDPosition,
      setPhysicsRBDRotation,
      setPhysicsRBDSphereProperty,
      setPhysicsWorldGravity,
      setPlayerInput,
      setSpotLightIntensity,
      setViewer,
      sizzleVec3XY,
      sizzleVec3XZ,
      sizzleVec3YZ,
      sizzleVec4WArray,
      sizzleVec4XYZ,
      sizzleVec4XYZArray,
      sleep,
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
      vec2ToVec3,
      vec3ToColor,
      vec3ToVec4,
      vector3AngleTo,
      vector3Project,
      vector3ProjectOnPlane,
      vector3Unproject,
    ].forEach((f) => poly.registerNamedFunction(f));
  }
}
