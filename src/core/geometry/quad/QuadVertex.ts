import {Vector3} from 'three';
import {CoreVertex} from '../vertex/CoreVertex';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {VertexAttributesDict, UserDataWithVertexAttributes} from '../vertex/Common';
import {QuadGeometry} from './QuadGeometry';
import {QuadObject} from './QuadObject';

export interface QuadGeometryWithVertexAttributes extends QuadGeometry {
	userData: UserDataWithVertexAttributes;
}

export class QuadVertex extends CoreVertex<CoreObjectType.QUAD> {
	constructor(public object: QuadObject, index: number) {
		super(object, index);
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): VertexAttributesDict | undefined {
		const geometry = (object as any as QuadObject).geometry as QuadGeometryWithVertexAttributes | undefined;
		if (!geometry) {
			return;
		}
		return geometry.userData.vertexAttributes;
	}
	static override verticesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return (object as any as QuadObject).geometry.index.length;
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
