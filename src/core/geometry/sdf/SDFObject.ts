import {Material, Matrix4, Box3, Sphere, Object3D, Vector3, Quaternion, Euler} from 'three';
import {SDFGeometry, SDFObjectType, SDFTesselationParams} from './SDFCommon';
import {ObjectContent, CoreObjectType, ObjectGeometryMap, objectContentCopyProperties} from '../ObjectContent';
import {SDFGeometryToObject3D} from './toObject3D/SDFToObject3D';
import {CoreType} from '../../Type';
import {Number3} from '../../../types/GlobalTypes';
import {SDFLoaderSync} from './SDFLoaderSync';

const _box = new Box3();
const _size = new Vector3();
const _t = new Vector3();
const _q = new Quaternion();
const _s = new Vector3();
const _euler = new Euler();
const _tN3: Number3 = [0, 0, 0];
const _rN3: Number3 = [0, 0, 0];
const _sN3: Number3 = [1, 1, 1];

// function cloneFloat32Array(src: Float32Array) {
// 	const clone = new Float32Array(src.length);
// 	let i = 0;
// 	for (let elem of src) {
// 		clone[i] = elem;
// 		i++;
// 	}
// 	console.log(src, clone);
// 	return clone;
// }
// function cloneUint32Array(src: Uint32Array) {
// 	const clone = new Uint32Array(src.length);
// 	let i = 0;
// 	for (let elem of src) {
// 		clone[i] = elem;
// 		i++;
// 	}
// 	console.log(src, clone);
// 	return clone;
// }
// function cloneSDFMesh(mesh:Mesh){
// 	const manifold = SDFLoaderSync.manifold();
// 			const clonedMesh = new manifold.Mesh({
// 			numProp: mesh.numProp,
// 			vertProperties: cloneFloat32Array(mesh.vertProperties),
// 			triVerts: cloneUint32Array(mesh.triVerts),
// 			mergeFromVert: mesh.mergeFromVert ? cloneUint32Array(mesh.mergeFromVert) : undefined,
// 			mergeToVert: mesh.mergeToVert ? cloneUint32Array(mesh.mergeToVert) : undefined,
// 			runIndex: mesh.runIndex ? cloneUint32Array(mesh.runIndex) : undefined,
// 			runOriginalID: mesh.runOriginalID ? cloneUint32Array(mesh.runOriginalID) : undefined,
// 			runTransform: mesh.runTransform ? cloneFloat32Array(mesh.runTransform) : undefined,
// 			faceID: mesh.faceID ? cloneUint32Array(mesh.faceID) : undefined,
// 			halfedgeTangent: mesh.halfedgeTangent ? cloneFloat32Array(mesh.halfedgeTangent) : undefined,
// 		});
// 		return clonedMesh
// }

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
	children: ObjectContent<CoreObjectType.SDF>[] = [];
	parent: ObjectContent<CoreObjectType.SDF> | null = null;
	private _type: SDFObjectType;
	constructor(private _geometry: SDFGeometry) {
		this._type = SDFObjectType.DEFAULT;
	}

	SDFGeometry() {
		return this.geometry! as SDFGeometry;
	}
	dispose() {}
	applyMatrix4(matrix: Matrix4) {
		// matrix is decomposed so that we can use .translate.rotate.scale,
		// as .transform isn't yet available
		matrix.decompose(_t, _q, _s);
		_euler.setFromQuaternion(_q);
		_t.toArray(_tN3);
		_s.toArray(_sN3);

		// euler.toArray makes the array becomes Number4
		_rN3[0] = _euler.x;
		_rN3[1] = _euler.y;
		_rN3[2] = _euler.z;
		const geometry = this.geometry.translate(_tN3).rotate(_rN3).scale(_sN3);
		this._geometry = geometry;
	}
	add(...object: ObjectContent<CoreObjectType>[]) {}
	remove(...object: ObjectContent<CoreObjectType>[]) {}
	traverse(callback: (object: SDFObject) => any) {
		callback(this);
	}

	clone(): SDFObject {
		const manifold = SDFLoaderSync.manifold();
		const mesh = this.geometry.getMesh();

		const clonedGeometry = new manifold.Manifold(mesh);

		// const clonedGeometry = this.geometry.asOriginal();
		const clone = new SDFObject(clonedGeometry);
		objectContentCopyProperties(this, clone);
		return clone;
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
		const bbox = this.geometry.boundingBox();
		target.min.fromArray(bbox.min);
		target.max.fromArray(bbox.max);
	}
	boundingSphere(target: Sphere): void {
		this.boundingBox(_box);
		_box.getCenter(target.center);
		_box.getSize(_size);
		const diameter = Math.max(_size.x, _size.y, _size.z);
		target.radius = diameter * 0.5;
	}
}
