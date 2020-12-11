import {Vector3 as Vector32} from "three/src/math/Vector3";
import {Color as Color2} from "three/src/math/Color";
export const VOLUME_UNIFORMS = {
  u_Color: {value: new Color2(1, 1, 1)},
  u_VolumeDensity: {value: 5},
  u_ShadowDensity: {value: 2},
  u_StepSize: {value: 0.01},
  u_BoundingBoxMin: {value: new Vector32(-1, -1, -1)},
  u_BoundingBoxMax: {value: new Vector32(1, 1, 1)},
  u_DirectionalLightDirection: {
    value: new Vector32(-1, -1, -1)
  }
};
