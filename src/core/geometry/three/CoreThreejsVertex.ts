import {BufferGeometry, Object3D, Mesh, Vector3} from 'three';
import {CoreVertex} from '../vertex/CoreVertex';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {VertexAttributesDict, UserDataWithVertexAttributes} from '../vertex/Common';

export interface BufferGeometryWithVertexAttributes extends BufferGeometry {
	userData: UserDataWithVertexAttributes;
}

export class CoreThreejsVertex extends CoreVertex<CoreObjectType.THREEJS> {
	constructor(public object: Object3D, index: number) {
		super(object, index);
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
