import { Vector3 } from 'three/src/math/Vector3';
import { Color } from 'three/src/math/Color';
export declare const VOLUME_UNIFORMS: {
    u_Color: {
        value: Color;
    };
    u_VolumeDensity: {
        value: number;
    };
    u_ShadowDensity: {
        value: number;
    };
    u_StepSize: {
        value: number;
    };
    u_BoundingBoxMin: {
        value: Vector3;
    };
    u_BoundingBoxMax: {
        value: Vector3;
    };
    u_DirectionalLightDirection: {
        value: Vector3;
    };
};
