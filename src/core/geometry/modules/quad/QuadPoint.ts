import {Vector3, BufferAttribute} from 'three';
import {ObjectGeometryMap, CoreObjectType, ObjectContent} from '../../ObjectContent';
import {TypedCorePoint} from '../../entities/point/CorePoint';
import {PointAttributesDict} from '../../entities/point/Common';
import {QuadObject} from './QuadObject';
import {Attribute} from '../../Attribute';

export class QuadPoint extends TypedCorePoint<CoreObjectType.QUAD> {
	protected _geometry?: ObjectGeometryMap[CoreObjectType.QUAD];
	protected override _object: QuadObject;
	constructor(object: QuadObject, index: number) {
		super(object, index);
		this._object = object;
		this._updateGeometry();
	}
	override object() {
		return this._object;
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
		const geometry = this._object.geometry;
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
		attribute: BufferAttribute
	) {}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): PointAttributesDict | undefined {
		const geometry = (object as any as QuadObject).geometry;
		if (!geometry) {
			return;
		}
		return geometry.attributes;
	}
	static override pointsCount<T extends CoreObjectType>(object: ObjectContent<T>): number {
		const positionAttribute = this.attribute(object, Attribute.POSITION);
		if (!positionAttribute) {
			return 0;
		}
		return positionAttribute.count;
	}
	override position(target: Vector3) {
		if (!this._geometry) {
			return target;
		}
		const {array} = this.attribute(Attribute.POSITION) as BufferAttribute;
		return target.fromArray(array, this._index * 3);
	}
	override normal(target: Vector3) {
		if (!this._geometry) {
			return target;
		}
		const {array} = this.attribute(Attribute.NORMAL) as BufferAttribute;
		return target.fromArray(array, this._index * 3);
	}
	static override computeNormals<T extends CoreObjectType>(object: ObjectContent<T>) {
		// const geometry = (object as QuadObject).geometry as BufferGeometry | undefined;
		// if (!geometry) {
		// 	return null;
		// }
		// geometry.computeVertexNormals();
	}

	//
	//
	//
	//
	//
	static override userDataAttribs<T extends CoreObjectType>(object: ObjectContent<T>) {
		return {};
	}
	static override setIndexedAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		values: string[],
		indices: number[]
	) {}
	static override attribValueIndex<T extends CoreObjectType>(
		object: ObjectContent<T>,
		index: number,
		attribName: string
	): number {
		return -1;
	}
	//
	//
	//
	//
	//
	static override renameAttrib<T extends CoreObjectType>(
		object: ObjectContent<T>,
		oldName: string,
		newName: string
	) {}

	static override deleteAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string) {}
}
