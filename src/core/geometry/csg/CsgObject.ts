import {Object3D, Material, Matrix4, Box3, Sphere, Vector3} from 'three';
import {CsgGeometryType, CsgTypeMap, CSGTesselationParams} from './CsgCommon';
import {csgGeometryTypeFromGeometry} from './CsgCoreType';
import {ObjectContent, CoreObjectType, ObjectGeometryMap, objectContentCopyProperties} from '../ObjectContent';
import {path2ToObject3D} from './toObject3D/CsgPath2ToObject3D';
import {geom2ToObject3D} from './toObject3D/CsgGeom2ToObject3D';
import {geom3ToObject3D} from './toObject3D/CsgGeom3ToObject3D';
import {matrix4ToMat4} from './math/CsgMat4';
import {csgBoundingBoxPath2, csgBoundingBoxGeom2, csgBoundingBoxGeom3} from './math/CsgBoundingBox';
import {TypeAssert} from '../../../engine/poly/Assert';
import {CoreType} from '../../Type';

const _box = new Box3();
const _size = new Vector3();

export class CsgObject<T extends CsgGeometryType> implements ObjectContent<CoreObjectType.CSG> {
	public visible = true;
	get geometry() {
		return this._geometry as ObjectGeometryMap[CoreObjectType.CSG];
	}
	get type() {
		return this._type;
	}
	parent = null;
	children = [];
	userData = {};
	name = '';
	castShadow = true;
	receiveShadow = true;
	renderOrder = 0;
	frustumCulled = true;
	matrixAutoUpdate = false;
	material: Material | undefined;
	private _type: T;
	constructor(private _geometry: CsgTypeMap[T]) {
		this._type = csgGeometryTypeFromGeometry(this._geometry);
		this._validate();
	}

	setGeometry<TE extends CsgGeometryType>(geometry: CsgTypeMap[TE]) {
		this._geometry = geometry as CsgTypeMap[T];
		this._validate();
	}
	private _validate() {
		const type = csgGeometryTypeFromGeometry(this._geometry) as T;
		if (type) {
			this._type = type;
		} else {
			console.error('no type for geometry', this._geometry);
		}
	}
	csgGeometry() {
		return this.geometry! as CsgTypeMap[T];
	}
	dispose() {}
	applyMatrix4(matrix: Matrix4) {
		matrix4ToMat4(matrix, this.csgGeometry().transforms);
	}
	traverse(callback: (object: CsgObject<T>) => any) {
		callback(this);
	}

	clone(): CsgObject<T> {
		// const geometry = cloneCsgGeometry(this.type, this.csgGeometry());
		const geometry = JSON.parse(JSON.stringify(this.csgGeometry()));
		const clone = new CsgObject(geometry) as CsgObject<T>;

		objectContentCopyProperties(this, clone);
		return clone;
	}
	toObject3D(tesselationParams: CSGTesselationParams): Object3D | Object3D[] | undefined {
		const object = CsgObject.toObject3D(this, this.type, tesselationParams);
		if (object) {
			if (CoreType.isArray(object)) {
				for (let element of object) {
					objectContentCopyProperties(this, element);
				}
			} else {
				objectContentCopyProperties(this, object);
			}
		}
		return object;
	}

	static toObject3D<T extends CsgGeometryType>(
		csgObject: CsgObject<T>,
		type: T,
		tesselationParams: CSGTesselationParams
	): Object3D | Object3D[] | undefined {
		switch (type) {
			case CsgGeometryType.PATH2: {
				return path2ToObject3D(csgObject.csgGeometry() as CsgTypeMap[CsgGeometryType.PATH2], tesselationParams);
			}
			case CsgGeometryType.GEOM2: {
				return geom2ToObject3D(csgObject.csgGeometry() as CsgTypeMap[CsgGeometryType.GEOM2], tesselationParams);
			}
			case CsgGeometryType.GEOM3: {
				return geom3ToObject3D(csgObject.csgGeometry() as CsgTypeMap[CsgGeometryType.GEOM3], tesselationParams);
			}
		}
		TypeAssert.unreachable(type);
	}

	boundingBox(target: Box3): void {
		// using the measurement functions from jscad
		// modifies the geometry matrix,
		// which shouldn't happen
		const type = this.type;
		switch (type) {
			case CsgGeometryType.PATH2: {
				return csgBoundingBoxPath2(this.csgGeometry() as CsgTypeMap[CsgGeometryType.PATH2], target);
			}
			case CsgGeometryType.GEOM2: {
				return csgBoundingBoxGeom2(this.csgGeometry() as CsgTypeMap[CsgGeometryType.GEOM2], target);
			}
			case CsgGeometryType.GEOM3: {
				return csgBoundingBoxGeom3(this.csgGeometry() as CsgTypeMap[CsgGeometryType.GEOM3], target);
			}
		}
		TypeAssert.unreachable(type);
	}
	boundingSphere(target: Sphere): void {
		this.boundingBox(_box);
		_box.getSize(_size);
		_box.getSize(target.center);
		const diameter = Math.max(_size.x, _size.y, _size.z);
		target.radius = diameter * 0.5;
	}
}
