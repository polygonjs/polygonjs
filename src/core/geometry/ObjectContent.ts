import {BufferGeometry, Object3D, Material, Matrix4} from 'three';
import {ObjectUtils} from '../ObjectUtils';
import type {CadGeometry} from './modules/cad/CadCommon';
import type {CsgGeometry} from './modules/csg/CsgCommon';
import type {QuadGeometry} from './modules/quad/QuadGeometry';
import type {SDFGeometry} from './modules/sdf/SDFCommon';
import type {TetGeometry} from './modules/tet/TetGeometry';
import {CoreEntity} from './CoreEntity';

export enum CoreObjectType {
	THREEJS = 'Object3D',
	CAD = 'CADObject',
	CSG = 'CSGObject',
	QUAD = 'QUADObject',
	SDF = 'SDFObject',
	TET = 'TetObject',
}

export interface ObjectGeometryMap {
	[CoreObjectType.THREEJS]: BufferGeometry;
	[CoreObjectType.CAD]: CadGeometry;
	[CoreObjectType.CSG]: CsgGeometry;
	[CoreObjectType.QUAD]: QuadGeometry;
	[CoreObjectType.SDF]: SDFGeometry;
	[CoreObjectType.TET]: TetGeometry;
}
export interface ObjectContent<T extends CoreObjectType> {
	type: string;
	geometry?: ObjectGeometryMap[T];
	userData: {[key: string]: any};
	name: string;
	visible: boolean;
	castShadow: boolean;
	receiveShadow: boolean;
	renderOrder: number;
	frustumCulled: boolean;
	matrixAutoUpdate: boolean;
	material?: Material | Material[];
	children: ObjectContent<T>[];
	parent: ObjectContent<T> | null;
	clone: () => ObjectContent<T>;
	dispose?: () => void;
	traverse(callback: (object: ObjectContent<T>) => any): void;
	applyMatrix4(matrix: Matrix4): void;
	add: (...object: any[]) => void;
	remove: (...object: any[]) => void;
	dispatchEvent: (event: {type: string}) => void;
}

export function isObject3D<T extends CoreObjectType>(o: ObjectContent<T>): o is Object3D {
	return o instanceof Object3D;
}

export function objectContentCopyProperties(src: ObjectContent<CoreObjectType>, target: ObjectContent<CoreObjectType>) {
	target.visible = src.visible;
	target.name = src.name;
	target.castShadow = src.castShadow;
	target.receiveShadow = src.receiveShadow;
	target.renderOrder = src.renderOrder;
	target.frustumCulled = src.frustumCulled;
	target.matrixAutoUpdate = src.matrixAutoUpdate;
	if (src.material) {
		target.material = src.material;
	}
	target.userData = ObjectUtils.cloneDeep(src.userData); //JSON.parse(JSON.stringify(this.userData));
}

export interface MergeCompactOptions {
	objects: ObjectContent<CoreObjectType>[];
	mergedObjects: ObjectContent<CoreObjectType>[];
	material?: Material;
	objectType: string;
	onError: (message: string) => void;
}

export type ObjectBuilder<T extends CoreObjectType> = (
	object: ObjectContent<T>,
	entities: CoreEntity[]
) => ObjectContent<T> | undefined;
