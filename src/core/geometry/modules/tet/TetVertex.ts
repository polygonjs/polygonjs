import {Vector3} from 'three';
import {CoreVertex} from '../../entities/vertex/CoreVertex';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {VertexAttributesDict, UserDataWithVertexAttributes} from '../../entities/vertex/Common';
import {TetObject} from './TetObject';
import {TetGeometry} from './TetGeometry';

export interface TetGeometryWithVertexAttributes extends TetGeometry {
	userData: UserDataWithVertexAttributes;
}

export class TetVertex extends CoreVertex<CoreObjectType.TET> {
	protected _geometry?: TetGeometry;
	constructor(public object: TetObject, index: number) {
		super(object, index);
		this._updateGeometry();
	}
	override setIndex(index: number, object?: TetObject) {
		this._index = index;
		if (object) {
			this.object = object;
			this._updateGeometry();
		}
		return this;
	}
	private _updateGeometry() {
		const geometry = this.object.geometry as TetGeometryWithVertexAttributes | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): VertexAttributesDict | undefined {
		return;
	}
	static override verticesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
	override position(target: Vector3) {
		console.warn('TetVertex.position not implemented');
		// _coreFace.setIndex(this._index, this._geometry as BufferGeometry);
		// _coreFace.center(target);
	}
	override normal(target: Vector3): Vector3 {
		console.warn('TetVertex.normal not implemented');
		// _coreFace.setIndex(this._index, this._geometry as BufferGeometry);
		// _coreFace.triangle(_triangle);
		// _triangle.getNormal(target);
		return target;
	}
}
