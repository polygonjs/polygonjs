import {Vector3} from 'three/src/math/Vector3';
import {Color} from 'three/src/math/Color';

export const VOLUME_UNIFORMS = {
	u_Color: {value: new Color(1, 1, 1)},
	u_VolumeDensity: {value: 5.0},
	u_ShadowDensity: {value: 2.0},
	u_StepSize: {value: 0.01},
	u_BoundingBoxMin: {value: new Vector3(-1, -1, -1)}, // geometry.boundingBox.min
	u_BoundingBoxMax: {value: new Vector3(1, 1, 1)}, //geometry.boundingBox.max
	u_DirectionalLightsDirection: {
		value: [new Vector3(-1, -1, -1)],
	},
};
