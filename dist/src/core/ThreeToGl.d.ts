import { Vector2 } from 'three/src/math/Vector2';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector4 } from 'three/src/math/Vector4';
export declare class ThreeToGl {
    static any(value: any): string;
    static numeric_array(values: number[]): string;
    static vector4(vec: Vector4 | string): string;
    static vector3(vec: Vector3 | string): string;
    static vector2(vec: Vector2 | string): string;
    static vector3_float(vec: Vector3 | string, num: number | string): string;
    static float4(x: number | string, y: number | string, z: number | string, w: number | string): string;
    static float3(x: number | string, y: number | string, z: number | string): string;
    static float2(x: number | string, y: number | string): string;
    static float(x: number | string): string;
    static int(x: number | string): string;
    static bool(x: number | string): string;
}
