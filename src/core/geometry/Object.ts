import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';
import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {Color} from 'three/src/math/Color';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {AnimationClip} from 'three/src/animation/AnimationClip';
import {Material} from 'three/src/materials/Material';
import {SkinnedMesh} from 'three/src/objects/SkinnedMesh';
import {Bone} from 'three/src/objects/Bone';

// import {CoreConstant} from './Constant'
import {CoreGeometry} from './Geometry';
import {GroupString} from './Group';
import {CoreAttribute} from './Attribute';
import {CoreConstant, AttribType, AttribSize} from './Constant';
import {CorePoint} from './Point';
import {CoreMaterial, ShaderMaterialWithCustomMaterials} from './Material';
import {CoreString} from '../String';

import lodash_cloneDeep from 'lodash/cloneDeep';
import lodash_isString from 'lodash/isString';
import lodash_isArray from 'lodash/isArray';
import lodash_isNumber from 'lodash/isNumber';
import {CoreEntity} from './Entity';
import {ParamInitValueSerialized} from '../../engine/params/types/ParamInitValueSerialized';
const PTNUM = 'ptnum';
const NAME_ATTR = 'name';
const ATTRIBUTES = 'attributes';

interface Object3DWithAnimations extends Object3D {
	animations: AnimationClip[];
}
interface MaterialWithColor extends Material {
	color: Color;
}
// interface SkinnedMeshWithisSkinnedMesh extends SkinnedMesh {
// 	readonly isSkinnedMesh: boolean;
// }

export class CoreObject extends CoreEntity {
	constructor(private _object: Object3D, index: number) {
		super(index);
		if (this._object.userData[ATTRIBUTES] == null) {
			this._object.userData[ATTRIBUTES] = {};
		}
	}

	// set_index(i: number) {
	// 	this._index = i;
	// }

	object() {
		return this._object;
	}
	geometry(): BufferGeometry | null {
		return (this._object as Mesh).geometry as BufferGeometry | null;
	}
	core_geometry(): CoreGeometry | null {
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
		return this.core_geometry()?.points() || [];
	}
	points_from_group(group: GroupString): CorePoint[] {
		if (group) {
			const indices = CoreString.indices(group);
			if (indices) {
				const points = this.points();
				return indices.map((i) => points[i]);
			} else {
				return [];
			}
		} else {
			return this.points();
		}
	}

	compute_vertex_normals() {
		this.core_geometry()?.compute_vertex_normals();
	}

	static add_attribute(object: Object3D, name: string, value: AttribValue) {
		let data: ParamInitValueSerialized;
		if (!lodash_isNumber(value) && !lodash_isArray(value) && !lodash_isString(value)) {
			data = (value as Vector3).toArray() as Number3;
		} else {
			data = value;
		}
		const user_data = object.userData;
		user_data[ATTRIBUTES] = user_data[ATTRIBUTES] || {};
		user_data[ATTRIBUTES][name] = data;
	}
	add_attribute(name: string, value: AttribValue) {
		CoreObject.add_attribute(this._object, name, value);
	}
	add_numeric_attrib(name: string, value: NumericAttribValue) {
		this.add_attribute(name, value);
	}
	set_attrib_value(name: string, value: AttribValue) {
		this.add_attribute(name, value);
	}
	add_numeric_vertex_attrib(name: string, size: number, default_value: NumericAttribValue) {
		if (default_value == null) {
			default_value = CoreAttribute.default_value(size);
		}
		this.core_geometry()?.add_numeric_attrib(name, size, default_value);
	}

	attribute_names(): string[] {
		// TODO: to remove
		return Object.keys(this._object.userData[ATTRIBUTES]);
	}
	attrib_names(): string[] {
		return this.attribute_names();
	}

	has_attrib(name: string): boolean {
		return this.attribute_names().includes(name);
	}

	rename_attribute(old_name: string, new_name: string) {
		this.add_attribute(new_name, this.attrib_value(old_name));
		this.delete_attribute(old_name);
	}

	delete_attribute(name: string) {
		delete this._object.userData[ATTRIBUTES][name];
	}

	attrib_value(name: string, target?: Vector2 | Vector3 | Vector4): AttribValue {
		if (name === PTNUM) {
			return this.index;
		} else {
			let val = this._object.userData[ATTRIBUTES][name] as AttribValue;
			if (val == null) {
				if (name == NAME_ATTR) {
					val = this._object.name;
				}
			} else {
				if (lodash_isArray(val) && target) {
					target.fromArray(val);
					return target;
				}
			}
			return val;
		}
	}
	string_attrib_value(name: string) {
		const str = this.attrib_value(name);
		if (lodash_isString(str)) {
			return str;
		} else {
			return `${str}`;
		}
	}
	name(): string {
		return this.attrib_value(NAME_ATTR) as string;
	}
	human_type(): string {
		return CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[this._object.constructor.name];
	}
	attrib_types() {
		const h: Dictionary<AttribType> = {};
		for (let attrib_name of this.attrib_names()) {
			const type = this.attrib_type(attrib_name);
			if (type != null) {
				h[attrib_name] = type;
			}
		}
		return h;
	}
	attrib_type(name: string) {
		const val = this.attrib_value(name);
		if (lodash_isString(val)) {
			return AttribType.STRING;
		} else {
			return AttribType.NUMERIC;
		}
	}
	attrib_sizes() {
		const h: Dictionary<AttribSize> = {};
		for (let attrib_name of this.attrib_names()) {
			const size = this.attrib_size(attrib_name);
			if (size != null) {
				h[attrib_name] = size;
			}
		}
		return h;
	}
	attrib_size(name: string): AttribSize | null {
		const val = this.attrib_value(name);
		if (val == null) {
			return null;
		}

		if (lodash_isString(val) || lodash_isNumber(val)) {
			return AttribSize.FLOAT;
		} else {
			switch (val.constructor) {
				case Vector2:
					return AttribSize.VECTOR2;
				case Vector3:
					return AttribSize.VECTOR3;
				case Vector4:
					return AttribSize.VECTOR4;
				default:
					return null;
			}
		}
	}

	clone() {
		return CoreObject.clone(this._object);
	}

	static clone(src_object: Object3D) {
		const new_object = src_object.clone();

		var sourceLookup = new Map<Object3D, Object3D>();
		var cloneLookup = new Map<Object3D, Object3D>();
		CoreObject.parallelTraverse(src_object, new_object, function (sourceNode: Object3D, clonedNode: Object3D) {
			sourceLookup.set(clonedNode, sourceNode);
			cloneLookup.set(sourceNode, clonedNode);
		});
		new_object.traverse(function (node) {
			const src_node = sourceLookup.get(node) as SkinnedMesh;
			const mesh_node = node as Mesh;

			if (mesh_node.geometry) {
				const src_node_geometry = src_node.geometry as BufferGeometry;
				mesh_node.geometry = CoreGeometry.clone(src_node_geometry);
				const mesh_node_geometry = mesh_node.geometry as BufferGeometry;
				if (mesh_node_geometry.userData) {
					mesh_node_geometry.userData = lodash_cloneDeep(src_node_geometry.userData);
				}
			}
			if (mesh_node.material) {
				mesh_node.material = src_node.material;
				CoreMaterial.apply_custom_materials(node, mesh_node.material as ShaderMaterialWithCustomMaterials);

				// prevents crashes for linesegments with shader material such as the line dashed instance
				// TODO: test
				const material_with_color = mesh_node.material as MaterialWithColor;
				if (material_with_color.color == null) {
					material_with_color.color = new Color(1, 1, 1);
				}
			}
			if (src_object.userData) {
				node.userData = lodash_cloneDeep(src_node.userData);
			}

			const src_node_with_animations = (<unknown>src_node) as Object3DWithAnimations;
			if (src_node_with_animations.animations) {
				(node as Object3DWithAnimations).animations = src_node_with_animations.animations.map((animation) =>
					animation.clone()
				);
			}

			const skinned_node = node as SkinnedMesh;
			if (skinned_node.isSkinnedMesh) {
				var clonedMesh = skinned_node;
				var sourceMesh = src_node;
				var sourceBones = sourceMesh.skeleton.bones;

				clonedMesh.skeleton = sourceMesh.skeleton.clone();
				clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);

				const new_bones = sourceBones.map(function (bone) {
					return cloneLookup.get(bone);
				}) as Bone[];

				clonedMesh.skeleton.bones = new_bones;

				clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
			}
		});

		return new_object;
	}

	static parallelTraverse(a: Object3D, b: Object3D, callback: (a: Object3D, b: Object3D) => void) {
		callback(a, b);
		for (var i = 0; i < a.children.length; i++) {
			this.parallelTraverse(a.children[i], b.children[i], callback);
		}
	}
}
