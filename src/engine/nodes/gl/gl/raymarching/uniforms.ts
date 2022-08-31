import {Vector3} from 'three';
import {IUniformN, IUniformV3} from '../../../utils/code/gl/Uniforms';

export interface RayMarchingUniforms {
	MAX_STEPS: IUniformN;
	MAX_DIST: IUniformN;
	SURF_DIST: IUniformN;
	CENTER: IUniformV3;
	// spotLightsRayMarching: IUniformV3Array;
}

export const RAYMARCHING_UNIFORMS: RayMarchingUniforms = {
	// u_BoundingBoxMin: {value: new Vector3(-1, -1, -1)}, // geometry.boundingBox.min
	// u_BoundingBoxMax: {value: new Vector3(1, 1, 1)}, //geometry.boundingBox.max
	// u_DirectionalLightDirection: {
	// 	// do not use an array, as currently loading and saving a uniform with an array does not work via the MaterialLoader
	// 	value: new Vector3(-1, -1, -1),
	// },
	MAX_STEPS: {
		value: 100,
	},
	MAX_DIST: {
		value: 100,
	},
	SURF_DIST: {
		value: 0.001,
	},
	CENTER: {
		value: new Vector3(0, 0, 0),
	},
	// spotLightsRayMarching: {
	// 	value: [],
	// 	// properties: {
	// 	// 	worldPos: {},
	// 	// },
	// },
};
