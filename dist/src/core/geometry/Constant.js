import {SkinnedMesh as SkinnedMesh2} from "three/src/objects/SkinnedMesh";
import {Scene as Scene2} from "three/src/scenes/Scene";
import {Points as Points2} from "three/src/objects/Points";
import {Group as Group2} from "three/src/objects/Group";
import {FrontSide} from "three/src/constants";
import {Color as Color2} from "three/src/math/Color";
import {Bone as Bone2} from "three/src/objects/Bone";
import {PointsMaterial as PointsMaterial2} from "three/src/materials/PointsMaterial";
import {MeshStandardMaterial as MeshStandardMaterial2} from "three/src/materials/MeshStandardMaterial";
import {MeshLambertMaterial as MeshLambertMaterial2} from "three/src/materials/MeshLambertMaterial";
import {LineBasicMaterial as LineBasicMaterial2} from "three/src/materials/LineBasicMaterial";
import {Object3D as Object3D2} from "three/src/core/Object3D";
import {Mesh as Mesh2} from "three/src/objects/Mesh";
import {LineSegments as LineSegments2} from "three/src/objects/LineSegments";
import {LOD as LOD2} from "three/src/objects/LOD";
export var ObjectType;
(function(ObjectType2) {
  ObjectType2["OBJECT3D"] = "Object3D";
  ObjectType2["MESH"] = "Mesh";
  ObjectType2["POINTS"] = "Points";
  ObjectType2["LINE_SEGMENTS"] = "LineSegments";
  ObjectType2["LOD"] = "LOD";
})(ObjectType || (ObjectType = {}));
export const OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE = {
  [ObjectType.MESH]: Mesh2,
  [ObjectType.POINTS]: Points2,
  [ObjectType.LINE_SEGMENTS]: LineSegments2,
  [ObjectType.OBJECT3D]: Object3D2,
  [ObjectType.LOD]: LOD2
};
export function object_type_from_constructor(constructor) {
  switch (constructor) {
    case Object3D2:
      return ObjectType.OBJECT3D;
    case Mesh2:
      return ObjectType.MESH;
    case Points2:
      return ObjectType.POINTS;
    case LineSegments2:
      return ObjectType.LINE_SEGMENTS;
    case LOD2:
      return ObjectType.LOD;
    default:
      console.warn("object type not supported", constructor);
      return ObjectType.MESH;
  }
}
export function ObjectTypeByObject(object) {
  if (object instanceof Mesh2) {
    return ObjectType.MESH;
  } else if (object instanceof LineSegments2) {
    return ObjectType.LINE_SEGMENTS;
  } else if (object instanceof Points2) {
    return ObjectType.POINTS;
  } else if (object instanceof Object3D2) {
    return ObjectType.OBJECT3D;
  }
  console.warn("ObjectTypeByObject received an unknown object type", object);
}
export const ObjectTypes = [ObjectType.MESH, ObjectType.POINTS, ObjectType.LINE_SEGMENTS];
export const ObjectTypeMenuEntries = [
  {name: "Mesh", value: ObjectTypes.indexOf(ObjectType.MESH)},
  {name: "Points", value: ObjectTypes.indexOf(ObjectType.POINTS)},
  {name: "LineSegments", value: ObjectTypes.indexOf(ObjectType.LINE_SEGMENTS)}
];
const materials = {
  MeshStandard: new MeshStandardMaterial2({
    color: 16777215,
    side: FrontSide,
    metalness: 0.5,
    roughness: 0.9
  }),
  [ObjectType.MESH]: new MeshLambertMaterial2({
    color: new Color2(0.5, 0.5, 1),
    side: FrontSide,
    vertexColors: false,
    transparent: true,
    depthTest: true
  }),
  [ObjectType.POINTS]: new PointsMaterial2({
    color: 16777215,
    size: 0.1,
    depthTest: true
  }),
  [ObjectType.LINE_SEGMENTS]: new LineBasicMaterial2({
    color: 16777215,
    linewidth: 1
  })
};
export var AttribClass;
(function(AttribClass2) {
  AttribClass2[AttribClass2["VERTEX"] = 0] = "VERTEX";
  AttribClass2[AttribClass2["OBJECT"] = 1] = "OBJECT";
})(AttribClass || (AttribClass = {}));
export const ATTRIBUTE_CLASSES = [0, 1];
export const AttribClassMenuEntries = [
  {name: "vertex", value: 0},
  {name: "object", value: 1}
];
export var AttribType;
(function(AttribType2) {
  AttribType2[AttribType2["NUMERIC"] = 0] = "NUMERIC";
  AttribType2[AttribType2["STRING"] = 1] = "STRING";
})(AttribType || (AttribType = {}));
export const ATTRIBUTE_TYPES = [0, 1];
export const AttribTypeMenuEntries = [
  {name: "numeric", value: 0},
  {name: "string", value: 1}
];
export var AttribSize;
(function(AttribSize2) {
  AttribSize2[AttribSize2["FLOAT"] = 1] = "FLOAT";
  AttribSize2[AttribSize2["VECTOR2"] = 2] = "VECTOR2";
  AttribSize2[AttribSize2["VECTOR3"] = 3] = "VECTOR3";
  AttribSize2[AttribSize2["VECTOR4"] = 4] = "VECTOR4";
})(AttribSize || (AttribSize = {}));
export const ATTRIBUTE_SIZES = [
  1,
  2,
  3,
  4
];
export const ATTRIBUTE_SIZE_RANGE = [1, 4];
export const CoreConstant = {
  ATTRIB_CLASS: {
    VERTEX: 0,
    OBJECT: 1
  },
  OBJECT_TYPES: ObjectTypes,
  CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME: {
    [Scene2.name]: "Scene",
    [Group2.name]: "Group",
    [Object3D2.name]: "Object3D",
    [Mesh2.name]: "Mesh",
    [Points2.name]: "Points",
    [LineSegments2.name]: "LineSegments",
    [Bone2.name]: "Bone",
    [SkinnedMesh2.name]: "SkinnedMesh"
  },
  CONSTRUCTORS_BY_NAME: {
    [ObjectType.MESH]: Mesh2,
    [ObjectType.POINTS]: Points2,
    [ObjectType.LINE_SEGMENTS]: LineSegments2
  },
  MATERIALS: materials
};
