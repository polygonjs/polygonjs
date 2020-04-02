import { Vector3 } from 'three/src/math/Vector3';
import { Vector2 } from 'three/src/math/Vector2';
export declare class CoreAttribute {
    static remap_name(name: string): string;
    static array_to_indexed_arrays(array: string[]): {
        indices: number[];
        values: string[];
    };
    static default_value(size: number): 0 | Vector2 | Vector3;
}
