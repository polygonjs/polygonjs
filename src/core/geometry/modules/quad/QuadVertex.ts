import {Vector3} from 'three';
import {CoreVertex} from '../../entities/vertex/CoreVertex';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {UserDataWithVertexAttributes, VertexAttributesDict} from '../../entities/vertex/Common';
import {QuadGeometry} from './QuadGeometry';
import {QuadObject} from './QuadObject';
import {BaseVertexAttribute} from '../../entities/vertex/VertexAttribute';

export interface QuadGeometryWithVertexAttributes extends QuadGeometry {
	userData: UserDataWithVertexAttributes;
}

export class QuadVertex extends CoreVertex<CoreObjectType.QUAD> {
	protected _geometry?: QuadGeometryWithVertexAttributes;
	constructor(object: QuadObject, index: number) {
		super(object, index);
		this._geometry = object.geometry as QuadGeometryWithVertexAttributes;
	}
	override setIndex(index: number, object?: QuadObject) {
		this._index = index;
		if (object) {
			this._object = object;
			this._updateGeometry();
		}
		return this;
	}
	private _updateGeometry() {
		const geometry = (this._object as QuadObject).geometry as QuadGeometryWithVertexAttributes | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	static override addAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		attribute: BaseVertexAttribute
	) {
		const geometry = (object as any as QuadObject).geometry as QuadGeometryWithVertexAttributes | undefined;
		if (!geometry) {
			return;
		}
		if (!geometry.userData) {
			return;
		}
		if (!geometry.userData.vertexAttributes) {
			geometry.userData.vertexAttributes = {};
		}
		geometry.userData.vertexAttributes[attribName] = attribute;
	}
	static override verticesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return (object as any as QuadObject).geometry.index.length;
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): VertexAttributesDict | undefined {
		return ((object as any as QuadObject).geometry as QuadGeometryWithVertexAttributes).userData.vertexAttributes;
	}
	override position(target: Vector3) {
		console.warn('QuadVertex.position not implemented');
	}
	override normal(target: Vector3): Vector3 {
		console.warn('QuadVertex.normal not implemented');
		return target;
	}
}
