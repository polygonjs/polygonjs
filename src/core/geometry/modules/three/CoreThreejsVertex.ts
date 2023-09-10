import {BufferGeometry, Object3D, Mesh, Vector3} from 'three';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {CoreVertex} from '../../entities/vertex/CoreVertex';
import {VertexAttributesDict, UserDataWithVertexAttributes} from '../../entities/vertex/Common';
import {BaseVertexAttribute} from '../../entities/vertex/VertexAttribute';

export interface BufferGeometryWithVertexAttributes extends BufferGeometry {
	userData: UserDataWithVertexAttributes;
}

export class CoreThreejsVertex extends CoreVertex<CoreObjectType.THREEJS> {
	protected _geometry?: BufferGeometry;

	constructor(public object: Object3D, index: number) {
		super(object, index);
		this._updateGeometry();
	}
	override setIndex(index: number, object?: Object3D) {
		this._index = index;
		if (object) {
			this.object = object;
			this._updateGeometry();
		}
		return this;
	}
	private _updateGeometry() {
		const geometry = (this.object as Mesh).geometry as BufferGeometryWithVertexAttributes | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	static override addAttribute(object: Object3D, attribName: string, attribute: BaseVertexAttribute) {
		const geometry = (object as Mesh).geometry as BufferGeometryWithVertexAttributes | undefined;
		if (!geometry) {
			return;
		}
		if (!geometry.userData) {
			console.warn('geometry has no userData');
			return;
		}
		if (!geometry.userData.vertexAttributes) {
			geometry.userData.vertexAttributes = {};
		}
		geometry.userData.vertexAttributes[attribName] = attribute;
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): VertexAttributesDict | undefined {
		const geometry = (object as any as Mesh).geometry as BufferGeometryWithVertexAttributes | undefined;
		if (!geometry) {
			return;
		}
		return geometry.userData.vertexAttributes;
	}
	static override verticesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return 0;
		}
		const index = geometry.getIndex();
		if (!index) {
			return 0;
		}
		return index.count;
	}
	override position(target: Vector3) {
		console.warn('CoreThreejsVertex.position not implemented');
		// _coreFace.setIndex(this._index, this._geometry as BufferGeometry);
		// _coreFace.center(target);
	}
	override normal(target: Vector3): Vector3 {
		console.warn('CoreThreejsVertex.normal not implemented');
		// _coreFace.setIndex(this._index, this._geometry as BufferGeometry);
		// _coreFace.triangle(_triangle);
		// _triangle.getNormal(target);
		return target;
	}
}
