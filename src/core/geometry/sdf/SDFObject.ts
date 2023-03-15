import {Material, Matrix4, Box3, Sphere, Object3D} from 'three';
import {SDFGeometry, SDFObjectType, SDFTesselationParams} from './SDFCommon';
import {ObjectContent, CoreObjectType, ObjectGeometryMap, objectContentCopyProperties} from '../ObjectContent';
import {SDFGeometryToObject3D} from './toObject3D/SDFToObject3D';
import {CoreType} from '../../Type';
import {SDFLoaderSync} from './SDFLoaderSync';

export class SDFObject implements ObjectContent<CoreObjectType.SDF> {
	public visible = true;
	get geometry() {
		return this._geometry as ObjectGeometryMap[CoreObjectType.SDF];
	}
	get type() {
		return this._type;
	}
	userData = {};
	name = '';
	castShadow = true;
	receiveShadow = true;
	renderOrder = 0;
	frustumCulled = true;
	matrixAutoUpdate = false;
	material: Material | undefined;
	private _type: SDFObjectType;
	constructor(private _geometry: SDFGeometry) {
		this._type = SDFObjectType.DEFAULT;
	}

	SDFGeometry() {
		return this.geometry! as SDFGeometry;
	}
	dispose() {}
	applyMatrix4(matrix: Matrix4) {
		console.warn('not implemented');
	}
	traverse(callback: (object: SDFObject) => any) {
		callback(this);
	}

	clone(): SDFObject {
		const manifold = SDFLoaderSync.manifold();
		const clonedGeometry = new manifold.Manifold(this.geometry.getMesh());
		const clone = new SDFObject(clonedGeometry);
		objectContentCopyProperties(this, clone);
		return this;
	}
	toObject3D(tesselationParams: SDFTesselationParams): Object3D | Object3D[] | undefined {
		const object = SDFGeometryToObject3D(this.geometry, tesselationParams);
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

	boundingBox(target: Box3): void {
		console.warn('boundingBox not implemented');
	}
	boundingSphere(target: Sphere): void {
		console.warn('boundingSphere not implemented');
	}
}
