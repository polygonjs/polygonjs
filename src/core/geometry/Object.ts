import {AttribValue, NumericAttribValue, PolyDictionary} from '../../types/GlobalTypes';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {Vector4} from 'three';
import {Object3D} from 'three';
import {Mesh} from 'three';
import {Color} from 'three';
import {BufferGeometry} from 'three';
import {AnimationClip} from 'three';
import {Material} from 'three';
import {SkinnedMesh} from 'three';
import {Bone} from 'three';
import {CoreGeometry} from './Geometry';
import {GroupString} from './Group';
import {Attribute, CoreAttribute} from './Attribute';
import {CoreConstant, AttribType, AttribSize} from './Constant';
import {CorePoint} from './Point';
import {CoreMaterial, MaterialWithCustomMaterials} from './Material';
import {CoreString} from '../String';
import {CoreEntity} from './Entity';
import {CoreType} from '../Type';
import {ObjectUtils} from '../ObjectUtils';
import {ArrayUtils} from '../ArrayUtils';
import {ThreeMeshBVHHelper} from '../../engine/operations/sop/utils/Bvh/ThreeMeshBVHHelper';
import {makeAttribReactiveVector4} from './attribute/Vector4';
import {AttributeReactiveCallback} from './attribute/_Base';
import {makeAttribReactiveVector3} from './attribute/Vector3';
import {makeAttribReactiveVector2} from './attribute/Vector2';
import {makeAttribReactiveSimple} from './attribute/Simple';
import {AttributeCallbackQueue} from './attribute/AttributeCallbackQueue';

enum PropertyName {
	NAME = 'name',
	POSITION = 'position',
}
const ATTRIBUTES = 'attributes';
const ATTRIBUTES_PREVIOUS_VALUES = 'attributesPreviousValues';

interface Object3DWithAnimations extends Object3D {
	animations: AnimationClip[];
}
interface MaterialWithColor extends Material {
	color: Color;
}
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
// interface SkinnedMeshWithisSkinnedMesh extends SkinnedMesh {
// 	readonly isSkinnedMesh: boolean;
// }

export type AttributeDictionary = PolyDictionary<AttribValue>;

export class CoreObject extends CoreEntity {
	constructor(private _object: Object3D, index: number) {
		super(index);
	}
	dispose() {}

	// set_index(i: number) {
	// 	this._index = i;
	// }

	object() {
		return this._object;
	}
	geometry(): BufferGeometry | null {
		return (this._object as Mesh).geometry as BufferGeometry | null;
	}
	coreGeometry(): CoreGeometry | null {
		const geo = this.geometry();
		if (geo) {
			return new CoreGeometry(geo);
		} else {
			return null;
		}
		// const geo = this.geometry()
		// if (geo) {
		// 	return new CoreGeometry(geo)
		// } else {
		// 	return null
		// }
	}
	points() {
		return this.coreGeometry()?.points() || [];
	}
	pointsFromGroup(group: GroupString): CorePoint[] {
		if (group) {
			const indices = CoreString.indices(group);
			if (indices) {
				const points = this.points();
				return ArrayUtils.compact(indices.map((i) => points[i]));
			} else {
				return [];
			}
		} else {
			return this.points();
		}
	}

	computeVertexNormals() {
		this.coreGeometry()?.computeVertexNormals();
	}

	static setAttribute(object: Object3D, attribName: string, value: AttribValue) {
		this.addAttribute(object, attribName, value);
	}
	static addAttribute(object: Object3D, attribName: string, value: AttribValue) {
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
		CoreObject.addAttribute(this._object, name, value);
	}
	addNumericAttrib(name: string, value: NumericAttribValue) {
		this.addAttribute(name, value);
	}
	setAttribValue(name: string, value: AttribValue) {
		this.addAttribute(name, value);
	}
	addNumericVertexAttrib(name: string, size: number, defaultValue: NumericAttribValue) {
		if (defaultValue == null) {
			defaultValue = CoreAttribute.default_value(size);
		}
		this.coreGeometry()?.addNumericAttrib(name, size, defaultValue);
	}
	static attributesDictionary(object: Object3D) {
		return (object.userData[ATTRIBUTES] as AttributeDictionary) || this._createAttributesDictionaryIfNone(object);
	}
	static attributesPreviousValuesDictionary(object: Object3D) {
		return (
			(object.userData[ATTRIBUTES_PREVIOUS_VALUES] as AttributeDictionary) ||
			this._createAttributesPreviousValuesDictionaryIfNone(object)
		);
	}
	private static _createAttributesDictionaryIfNone(object: Object3D) {
		if (!object.userData[ATTRIBUTES]) {
			return (object.userData[ATTRIBUTES] = {});
		}
	}
	private static _createAttributesPreviousValuesDictionaryIfNone(object: Object3D) {
		if (!object.userData[ATTRIBUTES_PREVIOUS_VALUES]) {
			return (object.userData[ATTRIBUTES_PREVIOUS_VALUES] = {});
		}
	}

	private _attributesDictionary() {
		return CoreObject.attributesDictionary(this._object);
	}
	attributeNames(): string[] {
		return this.attribNames();
	}
	static attribNames(object: Object3D): string[] {
		return Object.keys(CoreObject.attributesDictionary(object));
	}
	attribNames(): string[] {
		return CoreObject.attribNames(this._object);
	}

	hasAttrib(attribName: string): boolean {
		return CoreObject.hasAttrib(this._object, attribName);
	}
	static hasAttrib(object: Object3D, attribName: string) {
		return attribName in this.attributesDictionary(object);
	}

	renameAttrib(old_name: string, new_name: string) {
		const current_value = this.attribValue(old_name);
		if (current_value != null) {
			this.addAttribute(new_name, current_value);
			this.deleteAttribute(old_name);
		} else {
			console.warn(`attribute ${old_name} not found`);
		}
	}

	deleteAttribute(name: string) {
		delete this._attributesDictionary()[name];
	}
	static deleteAttribute(object: Object3D, attribName: string) {
		delete this.attributesDictionary(object)[attribName];
	}
	static attribValue(
		object: Object3D,
		attribName: string,
		index: number = 0,
		target?: Vector2 | Vector3 | Vector4
	): AttribValue | undefined {
		function _attribFromProperty() {
			if (attribName == PropertyName.NAME) {
				return object.name;
			}
			if (attribName == PropertyName.POSITION) {
				return object.position.toArray();
			}
		}
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
	static previousAttribValue(object: Object3D, attribName: string): AttribValue | undefined {
		const dict = this.attributesPreviousValuesDictionary(object);
		return dict[attribName];
	}

	static stringAttribValue(object: Object3D, attribName: string, index: number = 0): string | undefined {
		const str = this.attribValue(object, attribName, index);
		if (str != null) {
			if (CoreType.isString(str)) {
				return str;
			} else {
				return `${str}`;
			}
		}
	}
	static makeAttribReactive<V extends AttribValue>(
		object: Object3D,
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
		return CoreObject.attribValue(this._object, attribName, this._index, target);
	}
	stringAttribValue(name: string) {
		return CoreObject.stringAttribValue(this._object, name, this._index);
	}
	name(): string {
		return this.attribValue(PropertyName.NAME) as string;
	}
	humanType(): string {
		return CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[this._object.constructor.name];
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
	attribType(name: string) {
		const val = this.attribValue(name);
		if (CoreType.isString(val)) {
			return AttribType.STRING;
		} else {
			return AttribType.NUMERIC;
		}
	}
	attribSizes() {
		const h: PolyDictionary<AttribSize> = {};
		for (let attrib_name of this.attribNames()) {
			const size = this.attribSize(attrib_name);
			if (size != null) {
				h[attrib_name] = size;
			}
		}
		return h;
	}
	attribSize(name: string): AttribSize | null {
		const val = this.attribValue(name);
		if (val == null) {
			return null;
		}
		return CoreAttribute.attribSizeFromValue(val);
	}

	clone() {
		return CoreObject.clone(this._object);
	}

	static clone(srcObject: Object3D) {
		const clonedObject = srcObject.clone();

		var sourceLookup = new Map<Object3D, Object3D>();
		var cloneLookup = new Map<Object3D, Object3D>();
		CoreObject.parallelTraverse(srcObject, clonedObject, function (sourceNode: Object3D, clonedNode: Object3D) {
			sourceLookup.set(clonedNode, sourceNode);
			cloneLookup.set(sourceNode, clonedNode);
		});
		clonedObject.traverse(function (node) {
			const srcNode = sourceLookup.get(node) as SkinnedMesh | undefined;
			const meshNode = node as Mesh;

			if (meshNode.geometry && srcNode && srcNode.geometry) {
				const srcNodeGeometry = srcNode.geometry as BufferGeometry;
				meshNode.geometry = CoreGeometry.clone(srcNodeGeometry);
				ThreeMeshBVHHelper.copyBVH(meshNode, srcNode);
				// const mesh_node_geometry = meshNode.geometry as BufferGeometry;
				// if (mesh_node_geometry.userData) {
				// 	mesh_node_geometry.userData = ObjectUtils.cloneDeep(srcNodeGeometry.userData);
				// }
			}
			if (meshNode.material) {
				// no need to assign the material here
				// as this should already be done in the .clone() method.
				// Otherwise, when this is assigned here, some objects that rely on their own mat
				// such as sop/Reflector stop working when cloned
				// mesh_node.material = src_node.material;
				CoreMaterial.applyCustomMaterials(node, meshNode.material as MaterialWithCustomMaterials);

				// prevents crashes for linesegments with shader material such as the line dashed instance
				// TODO: test
				const material_with_color = meshNode.material as MaterialWithColor;
				if (material_with_color.color == null) {
					material_with_color.color = new Color(1, 1, 1);
				}
			}
			if (srcNode) {
				if (srcNode.userData) {
					node.userData = ObjectUtils.cloneDeep(srcNode.userData);
				}
				const src_node_with_animations = (<unknown>srcNode) as Object3DWithAnimations;
				if (src_node_with_animations.animations) {
					(node as Object3DWithAnimations).animations = src_node_with_animations.animations.map((animation) =>
						animation.clone()
					);
				}
				const skinned_node = node as SkinnedMesh;
				if (skinned_node.isSkinnedMesh) {
					var clonedMesh = skinned_node;
					var sourceMesh = srcNode;
					var sourceBones = sourceMesh.skeleton.bones;

					clonedMesh.skeleton = sourceMesh.skeleton.clone();
					clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);

					const new_bones = sourceBones.map(function (bone) {
						return cloneLookup.get(bone);
					}) as Bone[];

					clonedMesh.skeleton.bones = new_bones;

					clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
				}
			}
		});

		return clonedObject;
	}

	static parallelTraverse(a: Object3D, b: Object3D, callback: (a: Object3D, b: Object3D) => void) {
		callback(a, b);
		for (var i = 0; i < a.children.length; i++) {
			const childA = a.children[i];
			const childB = b.children[i];
			if (childA && childB) {
				this.parallelTraverse(childA, childB, callback);
			}
		}
	}
}
