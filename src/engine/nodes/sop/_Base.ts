import {Object3D} from 'three/src/core/Object3D';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
// import {Group} from 'three/src/objects/Group';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
// import lodash_includes from 'lodash/includes';
import lodash_range from 'lodash/range';
import lodash_times from 'lodash/times';
import {TypedNode} from '../_Base';
import {CoreConstant, ObjectByObjectType, OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreMaterial} from '../../../core/geometry/Material';
import {ObjectType} from '../../../core/geometry/Constant';

import {GeometryContainer} from '../../containers/Geometry';
import {TypedContainerController} from '../utils/ContainerController';
import {BaseMatNodeType} from '../mat/_Base';
import {NodeContext} from '../../poly/NodeContext';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerDB} from '../utils/FlagsController';
// import * as Container from '../../Container/Geometry';

// import {AttribTypeParam} from './concerns/AttribTypeParam';
// import {Bypass} from './Concerns/Bypass';
// import {GroupParam} from './concerns/GroupParam';
// import {Named} from './concerns/Named'; // TODO; typescript
// import {ObjectTypeParam} from './concerns/ObjectTypeParam';

// TODO: do I really need to add attributes in objects?
// TODO: after setting a node dirty, it should clear its object

// import {RequestContainerGeometryCallback} from '../../../Engine/Container/Geometry'
// const CONTAINER_CLASS = 'Geometry';

enum MESSAGE {
	FROM_SET_CORE_GROUP = 'from set_core_group',
	FROM_SET_GROUP = 'from set_group',
	FROM_SET_OBJECTS = 'from set_objects',
	FROM_SET_OBJECT = 'from set_object',
	FROM_SET_GEOMETRIES = 'from set_geometries',
	FROM_SET_GEOMETRY = 'from set_geometry',
}

const INPUT_GEOMETRY_NAME = 'input geometry';
const DEFAULT_INPUT_NAMES = [INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME, INPUT_GEOMETRY_NAME];

export class TypedSopNode<K extends NodeParamsConfig> extends TypedNode<'GEOMETRY', BaseSopNodeType, K> {
	container_controller: TypedContainerController<GeometryContainer> = new TypedContainerController<GeometryContainer>(
		this,
		GeometryContainer
	);
	public readonly flags: FlagsControllerDB = new FlagsControllerDB(this);

	static node_context(): NodeContext {
		return NodeContext.SOP;
	}

	static displayed_input_names(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	// _master_group: Group
	// _objects: Object3D[] = []

	initialize_base_node() {
		// this.flags.add_bypass();

		// this.flags.add_display();
		if (this.flags.display) {
			this.flags.display.set(false);
			this.flags.display.add_hook(() => {
				if (this.flags.display.active) {
					const parent = this.parent;
					if (parent && parent.display_node_controller) {
						parent.display_node_controller.set_display_node(this);
					}
				}
			});
		}
		this.io.outputs.set_has_one_output();
		// this.container_controller.init(CONTAINER_CLASS);
	}

	// request_container() {
	// 	return super.request_container(); //as Promise<GeometryContainer>;
	// }

	//
	//
	// GEOMETRY
	//
	//
	// group(): Group {
	// 	return this._master_group = this._master_group || this._create_group()
	// }
	// set_group(group: Group){
	// 	this._clear_objectsI() //(MESSAGE.FROM_SET_GROUP);
	// 	this._master_group.add(group)
	// 	// let child;

	// 	// const new_children = [];
	// 	// while (child = group.children[0]) {
	// 	// 	new_children.push(child);
	// 	// 	group.remove(child);
	// 	// }

	// 	// new_children.forEach(child=> {
	// 	// 	this._master_group.add( child );
	// 	// });

	// 	// // if (this.allow_add_object_attributes()) {
	// 	// 	this._master_group.traverse(object=> {
	// 	// 		this._set_object_attributes(object);
	// 	// 	});
	// 	// // }
	// 	this.set_container(this._master_group, MESSAGE.FROM_SET_GROUP);
	// }
	set_core_group(core_group: CoreGroup) {
		const objects = core_group.objects();
		for (let object of objects) {
			this._set_object_attributes(object);
		}
		this.set_container(core_group, MESSAGE.FROM_SET_CORE_GROUP);
	}

	set_object(object: Object3D) {
		// this._clear_objects();
		// this.add_object(object);
		// this.set_container(this.group(), MESSAGE.FROM_SET_OBJECT);
		this._set_object_attributes(object);
		// const core_group = new CoreGroup();
		// core_group.set_objects([object]);
		this.set_container_objects([object], MESSAGE.FROM_SET_OBJECT);
	}
	set_objects(objects: Object3D[]) {
		// this._clear_objects();
		// const list = objects;
		// lodash_times(list.length, i=> {
		// 	const object = list[i];
		// 	this.add_object(object);
		// });
		for (let object of objects) {
			this._set_object_attributes(object);
		}
		// const core_group = new CoreGroup();
		// core_group.set_objects(objects);
		this.set_container_objects(objects, MESSAGE.FROM_SET_OBJECTS);
	}

	// add_object(object: Object3D) {
	// 	if (object != null) {
	// 		this.group().add(object);
	// 		// if (this.allow_add_object_attributes()) {
	// 		this._set_object_attributes(object);
	// 		// }
	// 		return object;
	// 	}
	// }
	// add_geometry(geometry: BufferGeometry, type: ObjectType) {
	// 	let object;
	// 	if (geometry.index == null) {
	// 		this._add_index(geometry);
	// 	}

	// 	if ((object = this.create_object(geometry, type)) != null) {
	// 		this.add_object(object);
	// 	}
	// }

	set_geometry(geometry: BufferGeometry, type: ObjectType = ObjectType.MESH) {
		// this._clear_objects();
		// this.add_geometry(geometry, type);
		// this.set_container(this.group(), MESSAGE.FROM_SET_GEOMETRY);
		const object = this.create_object(geometry, type);
		// const core_group = new CoreGroup();
		// core_group.set_objects([object]);
		this.set_container_objects([object], MESSAGE.FROM_SET_GEOMETRY);
	}
	//this.end_cook()

	set_geometries(geometries: BufferGeometry[], type: ObjectType = ObjectType.MESH) {
		// this._clear_objects();
		const objects: Object3D[] = [];
		let object;
		geometries.forEach((geometry) => {
			object = this.create_object(geometry, type);
			this._set_object_attributes(object);
			objects.push(object);
		});
		// const core_group = new CoreGroup();
		// core_group.set_objects(objects);
		this.set_container_objects(objects, MESSAGE.FROM_SET_GEOMETRIES);
	}

	set_container_objects(objects: Object3D[], message: MESSAGE) {
		const core_group = this.container_controller.container.core_content() || new CoreGroup();
		core_group.set_objects(objects);
		core_group.touch();
		this.set_container(core_group);
	}

	// do_clone_inputs() {
	// 	let result = true;
	// 	if (this.has_param('do_not_clone_inputs')) {
	// 		result = false;
	// 	}
	// 	return result;
	// }
	// allow_add_object_attributes() {
	// 	if (!this.do_clone_inputs()) { return false; }
	// 	let result = true;
	// 	if (this.has_param('do_not_add_object_attributes')) {
	// 		result = false;
	// 	}
	// 	return result;
	// }

	// _create_group() {
	// 	const group = new Group();
	// 	group.name = this.full_path();

	// 	this._init_sop_bypass_group(group)

	// 	return group;
	// }

	create_object<OT extends ObjectType>(geometry: BufferGeometry, type: OT): ObjectByObjectType[OT] {
		// ensure it has an index
		if (!geometry.index) {
			const position_array = geometry.getAttribute('position').array;
			geometry.setIndex(lodash_range(position_array.length / 3));
		}

		// if (!lodash_includes(CoreConstant.OBJECT_TYPES, type)) {
		// 	const human_type = CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[type];
		// 	const human_names = CoreConstant.OBJECT_TYPES.map(
		// 		(n) => CoreConstant.CONSTRUCTOR_NAMES_BY_CONSTRUCTOR_NAME[n]
		// 	);
		// 	throw `type '${human_type}' not recognized. Available types are ${human_names.join(', ')}.`;
		// }

		// if (geometry != null) {
		const object_constructor = OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE[type]; //THREE[type];
		const material = CoreConstant.MATERIALS[type].clone();
		const object = new object_constructor(geometry, material);
		object.castShadow = true;
		object.receiveShadow = true;
		object.frustumCulled = false;

		return object as ObjectByObjectType[OT];
		// }
	}

	_set_object_attributes(object: Object3D) {
		// if (!this.allow_add_object_attributes()) { return; }
		// TODO: the exception below are just to debug when a geo could be reused or not cloned properly
		// I could remove that when more sure it all refreshes fine, and this would allow the null or merge to
		// not have to clone the data
		// if ((object.name == null) && (object.name !== '')) {
		// 	if (this.do_clone_inputs()) {
		// 		throw `object.name already set to ${object.node_name} (attempt to set by ${this.full_path()})`;
		// 	}
		// } else {
		// 	object.name = this.full_path();
		// }

		// if ((geometry = object.geometry) != null) {
		// 	if ((geometry.name == null) && (geometry.name !== '')) {
		// 		if (this.do_clone_inputs()) {
		// 			throw `geometry.node_name already set to ${geometry.node_name} (attempt to set by ${this.full_path()})`;
		// 		}
		// 	} else {
		// 		geometry.name = this.full_path();
		// 	}
		// }
		const material: Material = (object as Mesh).material as Material;
		if (material) {
			if (!this.scene) {
				console.log('no scene');
				throw 'no scene';
			}
			const material_node = CoreMaterial.node(this.scene, material) as BaseMatNodeType;
			if (material_node) {
				material_node.add_render_hook(object);
			}
		}
	}

	// _clear_objects() {
	// 	const group = this.group();

	// 	let child
	// 	while(child = group.children[0]) {
	// 		group.remove(child);
	// 	}
	// 	// const children = lodash_clone(group.children);
	// 	// let child;
	// 	// for(let i=0; i < children.length; i++){
	// 	// 	child = children[i]
	// 	// 	group.remove(child);
	// 	// 	child.traverse((object)=>{
	// 	// 		if (object.geometry != null) {
	// 	// 			object.geometry.dispose();
	// 	// 		}
	// 	// 		// no more material dispose since each the materials are not cloned
	// 	// 		// if (object.material){
	// 	// 		// 	if (lodash_isArray(object.material)){
	// 	// 		// 		object.material.forEach((mat)=>{mat.dispose()})
	// 	// 		// 	} else {
	// 	// 		// 		object.material.dispose()
	// 	// 		// 	}
	// 	// 		// }
	// 	// 	});
	// 	// }
	// }

	_add_index(geometry: BufferGeometry) {
		const position_attrib = geometry.getAttribute('position');
		const position_array = position_attrib.array;
		const points_count = position_array.length / 3;
		const indices: number[] = [];
		lodash_times(points_count, (i) => indices.push(i));

		geometry.setIndex(indices);
	}
}

export type BaseSopNodeType = TypedSopNode<NodeParamsConfig>;
export class BaseSopNodeClass extends TypedSopNode<NodeParamsConfig> {}
