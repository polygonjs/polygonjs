import { Vector4 } from 'three/src/math/Vector4';
import { Vector3 } from 'three/src/math/Vector3';
import { Vector2 } from 'three/src/math/Vector2';
export declare abstract class CoreEntity {
    protected _index: number;
    constructor(_index: number);
    get index(): number;
    abstract attrib_value(name: string, target?: Vector2 | Vector3 | Vector4): AttribValue | undefined;
    abstract string_attrib_value(name: string): string | undefined;
}
