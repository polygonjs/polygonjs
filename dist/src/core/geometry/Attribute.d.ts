import { Vector3 } from 'three/src/math/Vector3';
import { Vector2 } from 'three/src/math/Vector2';
import { BufferAttribute } from 'three/src/core/BufferAttribute';
export declare enum Attribute {
    POSITION = "position",
    NORMAL = "normal",
    TANGENT = "tangent"
}
export declare class CoreAttribute {
    static remap_name(name: string): string;
    static array_to_indexed_arrays(array: string[]): {
        indices: number[];
        values: string[];
    };
    static default_value(size: number): 0 | Vector2 | Vector3;
    static copy(src: BufferAttribute, dest: BufferAttribute, mark_as_needs_update?: boolean): void;
}
