import {Vector3} from 'three';
import {IUniformN, IUniformV3} from '../../../utils/code/gl/Uniforms';

export interface RayMarchingUniforms {
	MAX_STEPS: IUniformN;
	MAX_DIST: IUniformN;
	SURF_DIST: IUniformN;
	NORMALS_BIAS: IUniformN;
	CENTER: IUniformV3;
	debugMinSteps: IUniformN;
	debugMaxSteps: IUniformN;
	debugMinDepth: IUniformN;
	debugMaxDepth: IUniformN;
	shadowDistanceMin: IUniformN;
	shadowDistanceMax: IUniformN;
	shadowDepthMin: IUniformN;
	shadowDepthMax: IUniformN;
	// spotLightsRayMarching: IUniformV3Array;
}

export const RAYMARCHING_UNIFORMS: RayMarchingUniforms = {
	MAX_STEPS: {
		value: 100,
	},
	MAX_DIST: {
		value: 100,
	},
	SURF_DIST: {
		value: 0.001,
	},
	NORMALS_BIAS: {
		value: 0.01,
	},
	CENTER: {
		value: new Vector3(0, 0, 0),
	},
	debugMinSteps: {
		value: 0,
	},
	debugMaxSteps: {
		value: 128,
	},
	debugMinDepth: {
		value: 0,
	},
	debugMaxDepth: {
		value: 128,
	},
	shadowDistanceMin: {
		value: 0,
	},
	shadowDistanceMax: {
		value: 128,
	},
	shadowDepthMin: {
		value: 0,
	},
	shadowDepthMax: {
		value: 128,
	},
};
