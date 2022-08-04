// import {Vector3} from 'three';

export const RAYMARCHING_UNIFORMS = {
	// u_BoundingBoxMin: {value: new Vector3(-1, -1, -1)}, // geometry.boundingBox.min
	// u_BoundingBoxMax: {value: new Vector3(1, 1, 1)}, //geometry.boundingBox.max
	// u_DirectionalLightDirection: {
	// 	// do not use an array, as currently loading and saving a uniform with an array does not work via the MaterialLoader
	// 	value: new Vector3(-1, -1, -1),
	// },
	spotLightsRayMarching: {
		value: [],
		properties: {
			worldPos: {},
		},
	},
};
