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
export declare const ObjectTypes: ObjectType[];
export declare const ObjectTypeMenuEntries: {
    name: string;
    value: number;
}[];
export declare function ObjectTypeByObject(object: Object3D): ObjectType | undefined;
export declare enum AttribClass {
    VERTEX = 0,
    OBJECT = 1
}
export declare const AttribClassMenuEntries: {
    name: string;
    value: AttribClass;
}[];
export declare enum AttribType {
    NUMERIC = 0,
    STRING = 1
}
export declare const AttribTypeMenuEntries: {
    name: string;
    value: AttribType;
}[];
export declare const CoreConstant: {
    ATTRIB_CLASS: {
        VERTEX: AttribClass;
        OBJECT: AttribClass;
    };
    ATTRIB_TYPE: {
        NUMERIC: number;
        STRING: number;
    };
    OBJECT_TYPE: {
        MESH: ObjectType;
        POINTS: ObjectType;
        LINE_SEGMENTS: ObjectType;
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
