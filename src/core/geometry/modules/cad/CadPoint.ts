import {Vector3, BufferAttribute} from 'three';
import {ObjectGeometryMap, CoreObjectType, ObjectContent} from '../../ObjectContent';
import {TypedCorePoint} from '../../entities/point/CorePoint';
import {PointAttributesDict} from '../../entities/point/Common';
import {CadObject} from './CadObject';
import {CadGeometryType} from './CadCommon';

export class CadPoint extends TypedCorePoint<CoreObjectType.CAD> {
	protected _geometry?: ObjectGeometryMap[CoreObjectType.CAD];
	protected override _object: CadObject<CadGeometryType>;
	constructor(object: CadObject<CadGeometryType>, index: number) {
		super(object, index);
		this._object = object;
		this._updateGeometry();
	}
	override object() {
		return this._object;
	}
	override setIndex(index: number, object?: CadObject<CadGeometryType>) {
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
		return undefined;
	}
	static override pointsCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}
	override position(target: Vector3) {
		return target;
	}
	override normal(target: Vector3) {
		return target;
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
