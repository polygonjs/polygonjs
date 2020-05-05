import 'qunit';
import { Vector3 } from 'three/src/math/Vector3';
declare global {
    interface Assert {
        null: (num: number, message?: string) => void;
        not_null: (num: number, message?: string) => void;
        includes: (array: any[], element: any, message?: string) => void;
        in_delta: (val1: number, val2: number, max_delta: number, message?: string) => void;
        vector3_in_delta: (val1: Vector3, val2: Number3, max_delta?: number, message?: string) => void;
        less_than: (val1: number, max_val: number, message?: string) => void;
        less_than_or_equal: (val1: number, max_val: number, message?: string) => void;
        more_than: (val1: number, max_val: number, message?: string) => void;
        more_than_or_equal: (val1: number, max_val: number, message?: string) => void;
    }
}
export {};
