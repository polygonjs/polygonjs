import { Points } from 'three/src/objects/Points';
import { Object3D } from 'three/src/core/Object3D';
import { Mesh } from 'three/src/objects/Mesh';
import { LineSegments } from 'three/src/objects/LineSegments';
import { Material } from 'three/src/materials/Material';
interface MaterialsByString {
    [propName: string]: Material;
}
export declare enum ObjectType {
    MESH = "MESH",
    POINTS = "POINTS",
    LINE_SEGMENTS = "LINE_SEGMENTS"
}
export interface ObjectByObjectType {
    [ObjectType.MESH]: Mesh;
    [ObjectType.POINTS]: Points;
    [ObjectType.LINE_SEGMENTS]: LineSegments;
}
export interface ObjectConstructorByObjectType {
    [ObjectType.MESH]: typeof Mesh;
    [ObjectType.POINTS]: typeof Points;
    [ObjectType.LINE_SEGMENTS]: typeof LineSegments;
}
export declare const OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE: ObjectConstructorByObjectType;
export declare function object_type_from_constructor(constructor: Function): ObjectType;
export declare function ObjectTypeByObject(object: Object3D): ObjectType | undefined;
export declare const ObjectTypes: ObjectType[];
export declare const ObjectTypeMenuEntries: {
    name: string;
    value: number;
}[];
export declare enum AttribClass {
    VERTEX = 0,
    OBJECT = 1
}
export declare const ATTRIBUTE_CLASSES: Array<AttribClass>;
export declare const AttribClassMenuEntries: {
    name: string;
    value: AttribClass;
}[];
export declare enum AttribType {
    NUMERIC = 0,
    STRING = 1
}
export declare const ATTRIBUTE_TYPES: Array<AttribType>;
export declare const AttribTypeMenuEntries: {
    name: string;
    value: AttribType;
}[];
export declare enum AttribSize {
    FLOAT = 1,
    VECTOR2 = 2,
    VECTOR3 = 3,
    VECTOR4 = 4
}
export declare const ATTRIBUTE_SIZES: Array<AttribSize>;
export declare const ATTRIBUTE_SIZE_RANGE: Number2;
export declare const CoreConstant: {
    ATTRIB_CLASS: {
        VERTEX: AttribClass;
        OBJECT: AttribClass;
    };
    OBJECT_TYPES: ObjectType[];
    CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME: {
        [x: string]: string;
    };
    CONSTRUCTORS_BY_NAME: {
        MESH: typeof Mesh;
        POINTS: typeof Points;
        LINE_SEGMENTS: typeof LineSegments;
    };
    MATERIALS: MaterialsByString;
};
export {};
