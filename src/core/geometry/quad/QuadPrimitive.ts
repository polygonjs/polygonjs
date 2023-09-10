import {Vector3} from 'three';
import {CorePrimitive} from '../primitive/CorePrimitive';
import {PrimitiveAttributesDict, UserDataWithPrimitiveAttributes} from '../primitive/Common';
import {CoreObjectType, ObjectBuilder, ObjectContent} from '../ObjectContent';
import {QuadObject} from './QuadObject';
import {QuadGeometry} from './QuadGeometry';
import {BasePrimitiveAttribute} from '../primitive/PrimitiveAttribute';
import {quadObjectFromPrimitives} from './builders/QuadPrimitiveBuilder';
// import {CoreFace} from '../primitive/CoreFace';

// const _coreFace = new CoreFace();
// const _triangle = new Triangle();

export interface QuadGeometryWithPrimitiveAttributes extends QuadGeometry {
	userData: UserDataWithPrimitiveAttributes;
}

export class QuadPrimitive extends CorePrimitive<CoreObjectType.QUAD> {
	protected _geometry?: QuadGeometryWithPrimitiveAttributes;
	constructor(public object: QuadObject, index: number) {
		super(object, index);
		this._geometry = object.geometry as QuadGeometryWithPrimitiveAttributes;
	}
	override setIndex(index: number, object?: QuadObject) {
		this._index = index;
		if (object) {
			this.object = object;
			this._updateGeometry();
		}
		return this;
	}
	private _updateGeometry() {
		const geometry = (this.object as any as QuadObject).geometry as QuadGeometryWithPrimitiveAttributes | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	override builder<T extends CoreObjectType>() {
		return quadObjectFromPrimitives as any as ObjectBuilder<T>;
	}
	static override addAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		attribute: BasePrimitiveAttribute
	) {
		const geometry = (object as any as QuadObject).geometry as QuadGeometryWithPrimitiveAttributes | undefined;
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

	static override primitivesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return (object as any as QuadObject).geometry.index.length / 4;
	}
	static override attributes<T extends CoreObjectType>(
		object: ObjectContent<T>
	): PrimitiveAttributesDict | undefined {
		return ((object as any as QuadObject).geometry as QuadGeometryWithPrimitiveAttributes).userData.primAttributes;
	}

	position(target: Vector3) {
		console.warn('QuadPrimitive.position not implemented');
		// _coreFace.setIndex(this._index, this._geometry as QuadGeometryWithPrimitiveAttributes);
		// _coreFace.center(target);
	}
	normal(target: Vector3): Vector3 {
		// target.set(0, 0, 0);
		console.warn('QuadPrimitive.normal not implemented');
		// _coreFace.setIndex(this._index, this._geometry as QuadGeometryWithPrimitiveAttributes);
		// _coreFace.triangle(_triangle);
		// _triangle.getNormal(target);
		return target;
	}
}
