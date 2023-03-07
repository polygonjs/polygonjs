import {AttribValue, Number3, NumericAttribValue, PolyDictionary} from '../../types/GlobalTypes';
import {Box3, Matrix4, Sphere, Vector2, Vector3, Vector4} from 'three';
import {Attribute, CoreAttribute} from './Attribute';
import {AttribType, AttribSize} from './Constant';
import {CoreEntity} from './Entity';
import {CoreType} from '../Type';
import {makeAttribReactiveVector4} from './attribute/Vector4';
import {AttributeReactiveCallback} from './attribute/_Base';
import {makeAttribReactiveVector3} from './attribute/Vector3';
import {makeAttribReactiveVector2} from './attribute/Vector2';
import {makeAttribReactiveSimple} from './attribute/Simple';
import {AttributeCallbackQueue} from './attribute/AttributeCallbackQueue';
import {SetUtils} from '../../core/SetUtils';
import {MapUtils} from '../../core/MapUtils';
import {ObjectContent, CoreObjectType, ObjectGeometryMap, MergeCompactOptions} from './ObjectContent';
import {TransformTargetType} from '../Transform';
import {ObjectTransformSpace} from '../TransformSpace';
// import {computeBoundingBoxFromObject3D} from './BoundingBox';
// import {setSphereFromObject} from './BoundingSphere';

enum PropertyName {
	NAME = 'name',
	POSITION = 'position',
}
const ATTRIBUTES = 'attributes';
const ATTRIBUTES_PREVIOUS_VALUES = 'attributesPreviousValues';

const ORIGIN = new Vector3(0, 0, 0);
function _convertArrayToVector(value: number[]) {
	switch (value.length) {
		case 1:
			return value[0];
		case 2:
			return new Vector2(value[0], value[1]);
		case 3:
			return new Vector3(value[0], value[1], value[2]);
		case 4:
			return new Vector4(value[0], value[1], value[2], value[3]);
	}
}
const tmpVec3 = new Vector3();
const tmpN3: Number3 = [0, 0, 0];
// interface SkinnedMeshWithisSkinnedMesh extends SkinnedMesh {
// 	readonly isSkinnedMesh: boolean;
// }

export type AttributeDictionary = PolyDictionary<AttribValue>;

// export type PositionStaticMethod<T extends CoreObjectType> = (object: ObjectContent<T>, target: Vector3)=>void
// function DEFAULT_POSITION_STATIC_METHOD<T extends CoreObjectType>(object: ObjectContent<T>, target: Vector3) {
// 	target.copy(ORIGIN);
// }

// export type CoreObjectContent = Object3D|CadObject

export abstract class BaseCoreObject<T extends CoreObjectType> extends CoreEntity {
	constructor(protected _object: ObjectContent<T>, index: number) {
		super(index);
	}
	dispose() {}

	// set_index(i: number) {
	// 	this._index = i;
	// }

	object() {
		return this._object;
	}
	geometry(): ObjectGeometryMap[T] | null {
		return this._object.geometry || null; //(this._object as Mesh).geometry as BufferGeometry | null;
	}

	static setAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string, value: AttribValue) {
		this.addAttribute(object, attribName, value);
	}
	static addAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string, value: AttribValue) {
		if (CoreType.isArray(value)) {
			const convertedValue = _convertArrayToVector(value);
			if (!convertedValue) {
				const message = `attribute_value invalid`;
				console.error(message, value);
				throw new Error(message);
			}
		}

		const dict = this.attributesDictionary(object);
		const currentValue = dict[attribName];
		if (currentValue != null) {
			if (CoreType.isVector(currentValue) && CoreType.isVector(value)) {
				AttributeCallbackQueue.block();
				if (currentValue instanceof Vector2 && value instanceof Vector2) {
					currentValue.copy(value);
				}
				if (currentValue instanceof Vector3 && value instanceof Vector3) {
					currentValue.copy(value);
				}
				if (currentValue instanceof Vector4 && value instanceof Vector4) {
					currentValue.copy(value);
				}
				AttributeCallbackQueue.unblock();
				return;
			}
		}
		if (CoreType.isVector(value)) {
			// make sure to clone it, otherwise editing the attrib of one object would update another object's
			dict[attribName] = value.clone();
		} else {
			dict[attribName] = value;
		}
	}
	addAttribute(name: string, value: AttribValue) {
		(this.constructor as any as typeof BaseCoreObject<CoreObjectType>).addAttribute(this._object, name, value);
	}
	addNumericAttrib(name: string, value: NumericAttribValue) {
		this.addAttribute(name, value);
	}
	setAttribValue(name: string, value: AttribValue) {
		this.addAttribute(name, value);
	}
	// addNumericVertexAttrib(name: string, size: number, defaultValue: NumericAttribValue) {
	// 	// if (defaultValue == null) {
	// 	// 	defaultValue = CoreAttribute.default_value(size);
	// 	// }
	// 	// this.coreGeometry()?.addNumericAttrib(name, size, defaultValue);
	// }
	static attributesDictionary<T extends CoreObjectType>(object: ObjectContent<T>) {
		return (object.userData[ATTRIBUTES] as AttributeDictionary) || this._createAttributesDictionaryIfNone(object);
	}
	static attributesPreviousValuesDictionary<T extends CoreObjectType>(object: ObjectContent<T>) {
		return (
			(object.userData[ATTRIBUTES_PREVIOUS_VALUES] as AttributeDictionary) ||
			this._createAttributesPreviousValuesDictionaryIfNone(object)
		);
	}
	private static _createAttributesDictionaryIfNone<T extends CoreObjectType>(object: ObjectContent<T>) {
		if (!object.userData[ATTRIBUTES]) {
			return (object.userData[ATTRIBUTES] = {});
		}
	}
	private static _createAttributesPreviousValuesDictionaryIfNone<T extends CoreObjectType>(object: ObjectContent<T>) {
		if (!object.userData[ATTRIBUTES_PREVIOUS_VALUES]) {
			return (object.userData[ATTRIBUTES_PREVIOUS_VALUES] = {});
		}
	}

	private _attributesDictionary() {
		return (this.constructor as typeof BaseCoreObject<CoreObjectType>).attributesDictionary(this._object);
	}
	attributeNames(): string[] {
		return this.attribNames();
	}
	static attribNames<T extends CoreObjectType>(object: ObjectContent<T>): string[] {
		return Object.keys(this.attributesDictionary(object));
	}
	attribNames(): string[] {
		return (this.constructor as typeof BaseCoreObject<CoreObjectType>).attribNames(this._object);
	}
	static objectsAttribNames<T extends CoreObjectType>(objects: ObjectContent<T>[]) {
		const names: Set<string> = new Set();
		for (let object of objects) {
			const objectAttriNames = this.attribNames(object);
			for (let attribName of objectAttriNames) {
				names.add(attribName);
			}
		}

		return SetUtils.toArray(names);
	}
	static coreObjectsAttribNames<T extends CoreObjectType>(coreObjects: BaseCoreObject<T>[]) {
		const names: Set<string> = new Set();
		for (let coreObject of coreObjects) {
			const objectAttriNames = coreObject.attribNames();
			for (let attribName of objectAttriNames) {
				names.add(attribName);
			}
		}

		return SetUtils.toArray(names);
	}

	hasAttrib(attribName: string): boolean {
		return (this.constructor as any as typeof BaseCoreObject<CoreObjectType>).hasAttrib(this._object, attribName);
	}
	static hasAttrib<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string) {
		return attribName in this.attributesDictionary(object);
	}

	renameAttrib(old_name: string, new_name: string) {
		return (this.constructor as any as typeof BaseCoreObject<CoreObjectType>).renameAttrib(
			this._object,
			old_name,
			new_name
		);
	}
	static renameAttrib<T extends CoreObjectType>(object: ObjectContent<T>, old_name: string, new_name: string) {
		const current_value = this.attribValue(object, old_name);
		if (current_value != null) {
			this.addAttribute(object, new_name, current_value);
			this.deleteAttribute(object, old_name);
		} else {
			console.warn(`attribute ${old_name} not found`);
		}
	}

	deleteAttribute(name: string) {
		delete this._attributesDictionary()[name];
	}
	static deleteAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string) {
		delete this.attributesDictionary(object)[attribName];
	}
	// static position:PositionStaticMethod<CoreObjectType> = DEFAULT_POSITION_STATIC_METHOD
	static position(object: ObjectContent<CoreObjectType>, target: Vector3) {
		target.copy(ORIGIN);
	}
	position(target: Vector3) {
		(this.constructor as typeof BaseCoreObject<CoreObjectType>).position(this._object, target);
	}
	boundingBox(target: Box3) {
		target.makeEmpty();
	}
	boundingSphere(target: Sphere) {
		target.makeEmpty();
	}
	static attribValue<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		index: number = 0,
		target?: Vector2 | Vector3 | Vector4
	): AttribValue | undefined {
		const _attribFromProperty = () => {
			if (attribName == PropertyName.NAME) {
				return object.name;
			}
			if (attribName == PropertyName.POSITION) {
				const _target = target instanceof Vector3 ? target : tmpVec3;
				this.position(object, _target);
				_target.toArray(tmpN3);
				return tmpN3;
			}
		};
		if (attribName === Attribute.OBJECT_INDEX) {
			return index;
		}
		if (object.userData) {
			const dict = this.attributesDictionary(object);
			const val = dict[attribName];
			if (val == null) {
				return _attribFromProperty();
			} else {
				if (CoreType.isVector(val) && target) {
					if (val instanceof Vector3 && target instanceof Vector3) {
						return target.copy(val);
					}
					if (val instanceof Vector2 && target instanceof Vector2) {
						return target.copy(val);
					}
					if (val instanceof Vector4 && target instanceof Vector4) {
						return target.copy(val);
					}
				}
				if (CoreType.isArray(val) && target) {
					target.fromArray(val);
					return target;
				}
			}
			return val;
		}
		return _attribFromProperty();
	}
	static previousAttribValue<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string
	): AttribValue | undefined {
		const dict = this.attributesPreviousValuesDictionary(object);
		return dict[attribName];
	}

	static stringAttribValue<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		index: number = 0
	): string | undefined {
		const str = this.attribValue(object, attribName, index);
		if (str != null) {
			if (CoreType.isString(str)) {
				return str;
			} else {
				return `${str}`;
			}
		}
	}
	static makeAttribReactive<V extends AttribValue, T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		callback: AttributeReactiveCallback<V>
	) {
		const attributesDict = this.attributesDictionary(object);
		// const attributesPreviousValuesDict = this.attributesPreviousValuesDictionary(object);

		const currentValue = attributesDict[attribName];
		if (currentValue instanceof Vector4) {
			return makeAttribReactiveVector4(
				object,
				attribName,
				(<unknown>callback) as AttributeReactiveCallback<Vector4>
			);
		}
		if (currentValue instanceof Vector3) {
			return makeAttribReactiveVector3(
				object,
				attribName,
				(<unknown>callback) as AttributeReactiveCallback<Vector3>
			);
		}
		if (currentValue instanceof Vector2) {
			return makeAttribReactiveVector2(
				object,
				attribName,
				(<unknown>callback) as AttributeReactiveCallback<Vector2>
			);
		}
		return makeAttribReactiveSimple(
			object,
			attribName,
			(<unknown>callback) as AttributeReactiveCallback<string | number>
		);

		// // create a dummy val in case there is no attribute yet
		// if (attributesDict[attribName] == null) {
		// 	attributesDict[attribName] = 0;
		// }

		// const proxy: AttributeProxy<V> = {
		// 	value: attributesDict[attribName] as V,
		// 	previousValue: attributesDict[attribName] as V,
		// };
		// Object.defineProperties(attributesDict, {
		// 	[attribName]: {
		// 		get: function () {
		// 			return proxy.value;
		// 		},
		// 		set: function (x) {
		// 			if (x != proxy.value) {
		// 				proxy.previousValue = proxy.value;
		// 				proxy.value = x;
		// 				callback(proxy.value, proxy.previousValue);
		// 			}
		// 			return proxy.value;
		// 		},
		// 		configurable: true,
		// 	},
		// });
		// Object.defineProperties(attributesPreviousValuesDict, {
		// 	[attribName]: {
		// 		get: function () {
		// 			return proxy.previousValue;
		// 		},
		// 		configurable: true,
		// 	},
		// });
	}

	attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue | undefined {
		return (this.constructor as any as typeof BaseCoreObject<CoreObjectType>).attribValue(
			this._object,
			attribName,
			this._index,
			target
		);
	}
	stringAttribValue(name: string) {
		return (this.constructor as any as typeof BaseCoreObject<CoreObjectType>).stringAttribValue(
			this._object,
			name,
			this._index
		);
	}
	name(): string {
		return this.attribValue(PropertyName.NAME) as string;
	}
	humanType(): string {
		return this._object.type;
	}
	attribTypes() {
		const h: PolyDictionary<AttribType> = {};
		for (let attrib_name of this.attribNames()) {
			const type = this.attribType(attrib_name);
			if (type != null) {
				h[attrib_name] = type;
			}
		}
		return h;
	}
	static attribType<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string) {
		const val = this.attribValue(object, attribName);
		if (CoreType.isString(val)) {
			return AttribType.STRING;
		} else {
			return AttribType.NUMERIC;
		}
	}
	attribType(attribName: string) {
		return (this.constructor as any as typeof BaseCoreObject<CoreObjectType>).attribType(this._object, attribName);
	}
	static coreObjectAttributeTypesByName<T extends CoreObjectType>(
		coreObjects: BaseCoreObject<T>[]
	): PolyDictionary<AttribType[]> {
		const _typesByName: Map<string, Set<AttribType>> = new Map();
		for (let coreObject of coreObjects) {
			const objectAttriNames = coreObject.attribNames();
			for (let attribName of objectAttriNames) {
				const attribType = coreObject.attribType(attribName);
				MapUtils.addToSetAtEntry(_typesByName, attribName, attribType);
			}
		}

		const typesByName: PolyDictionary<AttribType[]> = {};
		_typesByName.forEach((attribTypes, attribName) => {
			typesByName[attribName] = SetUtils.toArray(attribTypes);
		});
		return typesByName;
		// const core_object = this.firstCoreObject();
		// if (core_object) {
		// 	for (let name of core_object.attribNames()) {
		// 		types_by_name[name] = core_object.attribType(name);
		// 	}
		// }
		// return types_by_name;
	}
	attribSizes() {
		const h: PolyDictionary<AttribSize> = {};
		const attribNames = this.attribNames();
		for (let attribName of attribNames) {
			const size = this.attribSize(attribName);
			if (size != null) {
				h[attribName] = size;
			}
		}
		return h;
	}
	static attribSize<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): AttribSize | null {
		const val = this.attribValue(object, attribName);
		if (val == null) {
			return null;
		}
		return CoreAttribute.attribSizeFromValue(val);
	}
	attribSize(attribName: string) {
		return (this.constructor as any as typeof BaseCoreObject<CoreObjectType>).attribSize(this._object, attribName);
	}
	static coreObjectsAttribSizesByName<T extends CoreObjectType>(
		coreObjects: BaseCoreObject<T>[]
	): PolyDictionary<AttribSize[]> {
		const _sizesByName: Map<string, Set<AttribSize>> = new Map();
		for (let coreObject of coreObjects) {
			const objectAttriNames = coreObject.attribNames();
			for (let attribName of objectAttriNames) {
				const attribSize = coreObject.attribSize(attribName);
				MapUtils.addToSetAtEntry(_sizesByName, attribName, attribSize);
			}
		}

		const sizesByName: PolyDictionary<AttribSize[]> = {};
		_sizesByName.forEach((attribSizes, attribName) => {
			sizesByName[attribName] = SetUtils.toArray(attribSizes);
		});
		return sizesByName;
	}

	clone(): BaseCoreObject<T> {
		const clonedObject = (this.constructor as typeof BaseCoreObject<CoreObjectType>).clone(this._object);
		return new (this.constructor as any)(clonedObject, this._index);
	}

	static clone<T extends CoreObjectType>(srcObject: ObjectContent<T>): ObjectContent<T> {
		return srcObject.clone() as ObjectContent<T>;
	}

	static applyMatrix(
		object: ObjectContent<CoreObjectType>,
		matrix: Matrix4,
		transformTargetType: TransformTargetType,
		transformSpace: ObjectTransformSpace
	) {
		console.warn('applyMatrix.override required', this);
	}
	static mergeCompact(options: MergeCompactOptions) {
		console.warn('mergeCompact.override required', this);
	}
}
