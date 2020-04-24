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

	initialize_base_node() {
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
	}

	set_core_group(core_group: CoreGroup) {
		const objects = core_group.objects();
		for (let object of objects) {
			this._set_object_attributes(object);
		}
		this.set_container(core_group, MESSAGE.FROM_SET_CORE_GROUP);
	}

	set_object(object: Object3D) {
		this._set_object_attributes(object);
		this.set_container_objects([object], MESSAGE.FROM_SET_OBJECT);
	}
	set_objects(objects: Object3D[]) {
		for (let object of objects) {
			this._set_object_attributes(object);
		}
		this.set_container_objects(objects, MESSAGE.FROM_SET_OBJECTS);
	}

	set_geometry(geometry: BufferGeometry, type: ObjectType = ObjectType.MESH) {
		const object = this.create_object(geometry, type);
		this.set_container_objects([object], MESSAGE.FROM_SET_GEOMETRY);
	}

	set_geometries(geometries: BufferGeometry[], type: ObjectType = ObjectType.MESH) {
		const objects: Object3D[] = [];
		let object;
		geometries.forEach((geometry) => {
			object = this.create_object(geometry, type);
			this._set_object_attributes(object);
			objects.push(object);
		});
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
		if (!geometry.index) {
			const position_array = geometry.getAttribute('position').array;
			geometry.setIndex(lodash_range(position_array.length / 3));
		}

		const object_constructor = OBJECT_CONSTRUCTOR_BY_OBJECT_TYPE[type]; //THREE[type];
		material = material || CoreConstant.MATERIALS[type].clone();
		const object = new object_constructor(geometry, material);
		object.castShadow = true;
		object.receiveShadow = true;
		object.frustumCulled = false;

		return object as ObjectByObjectType[OT];
		// }
	}

	protected _set_object_attributes(object: Object3D) {
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
