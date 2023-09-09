import {BufferGeometry, Object3D, Mesh} from 'three';
import {CorePrimitive} from '../primitive/CorePrimitive';
// import {BufferGeometryWithPrimitiveAttributes} from '../primitive/Common';
// import {CoreFace} from '../primitive/CoreFace';
import {CoreObjectType, ObjectContent} from '../ObjectContent';
import {PrimitiveAttributesDict, UserDataWithPrimitiveAttributes} from '../primitive/Common';
import {BasePrimitiveAttribute} from '../primitive/PrimitiveAttribute';

// const _coreFace = new CoreFace();
// const _triangle = new Triangle();

export interface BufferGeometryWithPrimitiveAttributes extends BufferGeometry {
	userData: UserDataWithPrimitiveAttributes;
}

export abstract class CoreThreejsPrimitive extends CorePrimitive<CoreObjectType.THREEJS> {
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
		const geometry = (this.object as any as Mesh).geometry as BufferGeometryWithPrimitiveAttributes | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	static override addAttribute(object: Object3D, attribName: string, attribute: BasePrimitiveAttribute) {
		const geometry = (object as any as Mesh).geometry as BufferGeometryWithPrimitiveAttributes | undefined;
		if (!geometry) {
			return;
		}
		if (!geometry.userData) {
			console.warn('geometry has no userData');
			return;
		}
		if (!geometry.userData.primAttributes) {
			geometry.userData.primAttributes = {};
		}
		geometry.userData.primAttributes[attribName] = attribute;
	}
	static override attributes<T extends CoreObjectType>(
		object: ObjectContent<T>
	): PrimitiveAttributesDict | undefined {
		const geometry = (object as any as Mesh).geometry as BufferGeometryWithPrimitiveAttributes | undefined;
		if (!geometry) {
			return;
		}
		return geometry.userData.primAttributes;
	}
}