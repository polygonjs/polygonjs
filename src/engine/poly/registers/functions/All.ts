import {PolyEngine} from '../../../Poly';
//

//
import {
	sizzleVec3XY,
	sizzleVec3XZ,
	sizzleVec3YZ,
	sizzleVec4XYZ,
	floatToVec3,
	vec2ToVec3,
	vec3ToVec4,
} from '../../../functions/conversion';
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
import {getObjectHoveredState} from '../../../functions/GetObjectHoveredState';
import {setObjectPosition} from '../../../functions/SetObjectPosition';
import {setObjectLookAt} from '../../../functions/SetObjectLookAt';
import {setObjectScale} from '../../../functions/SetObjectScale';

export interface NamedFunctionMap {
	floatToVec3: floatToVec3;
	getObjectHoveredState: getObjectHoveredState;

	globalsTime: globalsTime;
	globalsTimeDelta: globalsTimeDelta;
	globalsRaycaster: globalsRaycaster;
	globalsRayFromCursor: globalsRayFromCursor;
	globalsCursor: globalsCursor;
	planeSet: planeSet;
	rayIntersectPlane: rayIntersectPlane;
	setObjectPosition: setObjectPosition;

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
	setObjectLookAt: setObjectLookAt;
	setObjectScale: setObjectScale;
	sizzleVec3XY: sizzleVec3XY;
	sizzleVec3XZ: sizzleVec3XZ;
	sizzleVec3YZ: sizzleVec3YZ;
	sizzleVec4XYZ: sizzleVec4XYZ;

	vec2ToVec3: vec2ToVec3;
	vec3ToVec4: vec3ToVec4;
}

export class AllNamedFunctionRegister {
	static run(poly: PolyEngine) {
		poly.registerNamedFunction(floatToVec3);
		poly.registerNamedFunction(getObjectHoveredState);
		poly.registerNamedFunction(globalsTime);
		poly.registerNamedFunction(globalsTimeDelta);
		poly.registerNamedFunction(globalsRaycaster);
		poly.registerNamedFunction(globalsRayFromCursor);
		poly.registerNamedFunction(globalsCursor);
		poly.registerNamedFunction(planeSet);
		poly.registerNamedFunction(rayIntersectPlane);
		poly.registerNamedFunction(setObjectPosition);
		poly.registerNamedFunction(SDFBox);
		poly.registerNamedFunction(SDFIntersect);
		poly.registerNamedFunction(SDFRevolutionX);
		poly.registerNamedFunction(SDFRevolutionY);
		poly.registerNamedFunction(SDFRevolutionZ);
		poly.registerNamedFunction(SDFRoundedX);
		poly.registerNamedFunction(SDFSmoothUnion);
		poly.registerNamedFunction(SDFSmoothSubtract);
		poly.registerNamedFunction(SDFSmoothIntersect);
		poly.registerNamedFunction(SDFSphere);
		poly.registerNamedFunction(SDFSubtract);
		poly.registerNamedFunction(SDFUnion);
		poly.registerNamedFunction(setObjectLookAt);
		poly.registerNamedFunction(setObjectScale);
		poly.registerNamedFunction(sizzleVec3XY);
		poly.registerNamedFunction(sizzleVec3XZ);
		poly.registerNamedFunction(sizzleVec3YZ);
		poly.registerNamedFunction(sizzleVec4XYZ);
		poly.registerNamedFunction(vec2ToVec3);
		poly.registerNamedFunction(vec3ToVec4);
	}
}
