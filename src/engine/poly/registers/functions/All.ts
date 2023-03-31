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
import {setObjectPosition} from '../../../functions/SetObjectPosition';
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
	setObjectAttribute: setObjectAttribute;
	setObjectLookAt: setObjectLookAt;
	setObjectPosition: setObjectPosition;
	setObjectScale: setObjectScale;
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
			planeSet,
			rayIntersectPlane,
			setObjectPosition,
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
			setObjectAttribute,
			setObjectLookAt,
			setObjectScale,
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
