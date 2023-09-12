import {
	BufferGeometry,
	Object3D,
	Mesh,
	Vector3,
	BufferAttribute,
	Float32BufferAttribute,
	Int32BufferAttribute,
	InstancedBufferAttribute,
} from 'three';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {TypedCorePoint} from '../../entities/point/CorePoint';
import {PointAttributesDict} from '../../entities/point/Common';
import {Attribute} from '../../Attribute';
import {ObjectUtils} from '../../../ObjectUtils';
import {ColorLike, NumericAttribValue, Vector2Like, Vector3Like, Vector4Like} from '../../../../types/GlobalTypes';
import {isNumber, isArray} from '../../../Type';
import {markedAsInstance} from '../../GeometryUtils';
import {pointsCountFromBufferGeometry, positionAttributeNameFromBufferGeometry} from './CoreThreejsPointUtils';

// const IS_INSTANCE_KEY = 'isInstance';
const INDEX_ATTRIB_VALUES = 'indexedAttribValues';

export class CoreThreejsPoint extends TypedCorePoint<CoreObjectType.THREEJS> {
	protected _geometry?: BufferGeometry;

	constructor(object: Object3D, index: number) {
		super(object, index);
		this._updateGeometry();
	}

	override setIndex(index: number, object?: Object3D) {
		this._index = index;
		if (object) {
			this._object = object;
			this._updateGeometry();
		}
		return this;
	}
	private _updateGeometry() {
		const geometry = (this._object as Mesh).geometry as BufferGeometry | undefined;
		if (geometry) {
			this._geometry = geometry;
		}
	}
	geometry() {
		return this._geometry;
	}
	static override addAttribute(object: Object3D, attribName: string, attribute: BufferAttribute) {
		const geometry = (object as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return;
		}
		geometry.setAttribute(attribName, attribute);
	}
	static override attributes<T extends CoreObjectType>(object: ObjectContent<T>): PointAttributesDict | undefined {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return;
		}
		return geometry.attributes;
	}
	static override pointsCount<T extends CoreObjectType>(object: ObjectContent<T>): number {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return 0;
		}
		return pointsCountFromBufferGeometry(geometry);
	}
	static positionAttributeName<T extends CoreObjectType>(object: ObjectContent<T>) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return null;
		}
		return positionAttributeNameFromBufferGeometry(geometry);
	}
	override position(target: Vector3) {
		if (!this._geometry) {
			return target;
		}
		const {array} = this._geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
		return target.fromArray(array, this._index * 3);
	}
	override normal(target: Vector3): Vector3 {
		if (!this._geometry) {
			return target;
		}
		const {array} = this._geometry.getAttribute(Attribute.NORMAL) as BufferAttribute;
		return target.fromArray(array, this._index * 3);
	}
	static override computeNormals<T extends CoreObjectType>(object: ObjectContent<T>) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return null;
		}
		geometry.computeVertexNormals();
	}
	static override markAttribAsNeedsUpdate<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return null;
		}
		const attribute = geometry.getAttribute(attribName);
		if (!attribute) {
			return;
		}
		attribute.needsUpdate = true;
	}

	//
	//
	//
	//
	//
	static override userDataAttribs<T extends CoreObjectType>(object: ObjectContent<T>) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return {};
		}
		return (geometry.userData[INDEX_ATTRIB_VALUES] = geometry.userData[INDEX_ATTRIB_VALUES] || {});
	}
	static override setIndexedAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		values: string[],
		indices: number[]
	) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return;
		}
		this.setIndexedAttributeValues(object, attribName, values);
		geometry.setAttribute(attribName, new Int32BufferAttribute(indices, 1));
		geometry.getAttribute(attribName).needsUpdate = true;
	}
	static override attribValueIndex<T extends CoreObjectType>(
		object: ObjectContent<T>,
		index: number,
		attribName: string
	): number {
		if (this.isAttribIndexed(object, attribName)) {
			const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
			if (geometry) {
				return (geometry.getAttribute(attribName) as BufferAttribute).array[index];
			}
		}
		return -1;
	}
	//
	//
	//
	//
	//
	static override renameAttrib<T extends CoreObjectType>(object: ObjectContent<T>, oldName: string, newName: string) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return;
		}
		if (this.isAttribIndexed(object, oldName)) {
			this.userDataAttribs(object)[newName] = ObjectUtils.clone(this.userDataAttribs(object)[oldName]);
			delete this.userDataAttribs(object)[oldName];
		}

		const oldAttrib = geometry.getAttribute(oldName) as BufferAttribute;
		geometry.setAttribute(newName.trim(), new Float32BufferAttribute(oldAttrib.array, oldAttrib.itemSize));
		return geometry.deleteAttribute(oldName);
	}

	static override deleteAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return;
		}
		if (this.isAttribIndexed(object, attribName)) {
			delete this.userDataAttribs(object)[attribName];
		}

		return geometry.deleteAttribute(attribName);
	}

	static override addNumericAttrib<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		size: number = 1,
		defaultValue: NumericAttribValue = 0
	) {
		const geometry = (object as any as Mesh).geometry as BufferGeometry | undefined;
		if (!geometry) {
			return;
		}
		const values = [];
		const pointsCount = this.pointsCount(object);

		let attributeAdded = false;
		if (isNumber(defaultValue)) {
			// adding number
			for (let i = 0; i < pointsCount; i++) {
				for (let j = 0; j < size; j++) {
					values.push(defaultValue);
				}
			}
			attributeAdded = true;
		} else {
			if (size > 1) {
				if (isArray(defaultValue)) {
					// adding array
					for (let i = 0; i < pointsCount; i++) {
						for (let j = 0; j < size; j++) {
							values.push(defaultValue[j]);
						}
					}
					attributeAdded = true;
				} else {
					// adding Vector2
					const vec2 = defaultValue as Vector2Like;
					if (size == 2 && vec2.x != null && vec2.y != null) {
						for (let i = 0; i < pointsCount; i++) {
							values.push(vec2.x);
							values.push(vec2.y);
						}
						attributeAdded = true;
					}
					// adding Vector3
					const vec3 = defaultValue as Vector3Like;
					if (size == 3 && vec3.x != null && vec3.y != null && vec3.z != null) {
						for (let i = 0; i < pointsCount; i++) {
							values.push(vec3.x);
							values.push(vec3.y);
							values.push(vec3.z);
						}
						attributeAdded = true;
					}
					// adding Color
					const col = defaultValue as ColorLike;
					if (size == 3 && col.r != null && col.g != null && col.b != null) {
						for (let i = 0; i < pointsCount; i++) {
							values.push(col.r);
							values.push(col.g);
							values.push(col.b);
						}
						attributeAdded = true;
					}
					// adding Vector4
					const vec4 = defaultValue as Vector4Like;
					if (size == 4 && vec4.x != null && vec4.y != null && vec4.z != null && vec4.w != null) {
						for (let i = 0; i < pointsCount; i++) {
							values.push(vec4.x);
							values.push(vec4.y);
							values.push(vec4.z);
							values.push(vec4.w);
						}
						attributeAdded = true;
					}
				}
			}
		}

		if (attributeAdded) {
			if (markedAsInstance(geometry)) {
				const valuesAsTypedArray = new Float32Array(values);
				geometry.setAttribute(attribName.trim(), new InstancedBufferAttribute(valuesAsTypedArray, size));
			} else {
				geometry.setAttribute(attribName.trim(), new Float32BufferAttribute(values, size));
			}
		} else {
			console.warn(defaultValue);
			throw `CoreGeometry.add_numeric_attrib error: no other default value allowed for now in add_numeric_attrib (default given: ${defaultValue})`;
		}
	}
}
