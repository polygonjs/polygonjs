import {Object3D} from 'three/src/core/Object3D';
import {Material} from 'three/src/materials/Material';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import lodash_times from 'lodash/times';
import {TypedNode} from '../_Base';
import {CoreConstant, ObjectByObjectType, OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE} from '../../../core/geometry/Constant';
import {CoreGroup} from '../../../core/geometry/Group';
import {ObjectType} from '../../../core/geometry/Constant';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {FlagsControllerDB} from '../utils/FlagsController';
import {CoreGeometryIndexBuilder} from '../../../core/geometry/util/IndexBuilder';

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

class BaseNetworkSopParamsConfig extends NodeParamsConfig {}
export class BaseNetworkSopNode extends TypedNode<NodeContext.SOP, BaseNetworkSopParamsConfig> {
	static node_context(): NodeContext {
		return NodeContext.SOP;
	}
	// initialize_base_node() {
	// 	this.children_controller?.init({dependent: false});
	// }
	cook() {
		this.cook_controller.end_cook();
	}
}

export class TypedSopNode<K extends NodeParamsConfig> extends TypedNode<NodeContext.SOP, K> {
	static node_context(): NodeContext {
		return NodeContext.SOP;
	}
	public readonly flags: FlagsControllerDB = new FlagsControllerDB(this);

	static displayed_input_names(): string[] {
		return DEFAULT_INPUT_NAMES;
	}

	initialize_base_node() {
		this.flags.display.set(false);
		this.flags.display.add_hook(() => {
			if (this.flags.display.active) {
				const parent = this.parent;
				if (parent && parent.display_node_controller) {
					parent.display_node_controller.set_display_node(this);
				}
			}
		});
		this.io.outputs.set_has_one_output();
	}

	set_core_group(core_group: CoreGroup) {
		// const objects = core_group.objects();
		// for (let object of objects) {
		// 	this._set_object_attributes(object);
		// }
		this.set_container(core_group, MESSAGE.FROM_SET_CORE_GROUP);
	}

	set_object(object: Object3D) {
		// this._set_object_attributes(object);
		this.set_container_objects([object], MESSAGE.FROM_SET_OBJECT);
	}
	set_objects(objects: Object3D[]) {
		// for (let object of objects) {
		// 	this._set_object_attributes(object);
		// }
		this.set_container_objects(objects, MESSAGE.FROM_SET_OBJECTS);
	}

	set_geometry(geometry: BufferGeometry, type: ObjectType = ObjectType.MESH) {
		const object = this.create_object(geometry, type);
		this.set_container_objects([object], MESSAGE.FROM_SET_GEOMETRY);
	}

	set_geometries(geometries: BufferGeometry[], type: ObjectType = ObjectType.MESH) {
		const objects: Object3D[] = [];
		let object;
		for (let geometry of geometries) {
			object = this.create_object(geometry, type);
			// this._set_object_attributes(object);
			objects.push(object);
		}
		this.set_container_objects(objects, MESSAGE.FROM_SET_GEOMETRIES);
	}

	set_container_objects(objects: Object3D[], message: MESSAGE) {
		const core_group = this.container_controller.container.core_content() || new CoreGroup();
		core_group.set_objects(objects);
		core_group.touch();
		this.set_container(core_group);
	}

	create_object<OT extends ObjectType>(
		geometry: BufferGeometry,
		type: OT,
		material?: Material
	): ObjectByObjectType[OT] {
		// ensure it has an index
		this._create_index_if_none(geometry);

		const object_constructor = OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE[type]; //THREE[type];
		material = material || CoreConstant.MATERIALS[type].clone();
		const object = new object_constructor(geometry, material);
		object.castShadow = true;
		object.receiveShadow = true;
		object.frustumCulled = false;

		return object as ObjectByObjectType[OT];
		// }
	}

	protected _create_index_if_none(geometry: BufferGeometry) {
		CoreGeometryIndexBuilder.create_index_if_none(geometry);
	}

	// protected _set_object_attributes(object: Object3D) {
	// 	const material: Material = (object as Mesh).material as Material;
	// 	if (material) {
	// 		if (!this.scene) {
	// 			console.log('no scene');
	// 			throw 'no scene';
	// 		}
	// 		// const material_node = CoreMaterial.node(this.scene, material) as BaseMatNodeType;
	// 		// if (material_node) {
	// 		// 	material_node.add_render_hook(object);
	// 		// }
	// 	}
	// }

	protected _add_index(geometry: BufferGeometry) {
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
