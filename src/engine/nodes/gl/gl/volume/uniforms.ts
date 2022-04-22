import {Vector3} from 'three';
import {Color} from 'three';

export const VOLUME_UNIFORMS = {
	u_Color: {value: new Color(1, 1, 1)},
	u_VolumeDensity: {value: 5.0},
	u_ShadowDensity: {value: 2.0},
	u_StepSize: {value: 0.01},
	u_BoundingBoxMin: {value: new Vector3(-1, -1, -1)}, // geometry.boundingBox.min
	u_BoundingBoxMax: {value: new Vector3(1, 1, 1)}, //geometry.boundingBox.max
	u_DirectionalLightDirection: {
		// do not use an array, as currently loading and saving a uniform with an array does not work via the MaterialLoader
		value: new Vector3(-1, -1, -1),
	},
};
