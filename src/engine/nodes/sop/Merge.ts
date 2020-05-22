import {TypedSopNode} from './_Base';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Object3D} from 'three/src/core/Object3D';
import {ObjectType, object_type_from_constructor} from '../../../core/geometry/Constant';

const INPUT_NAME = 'geometry to merge';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {MapUtils} from '../../../core/MapUtils';
import {Material} from 'three/src/materials/Material';
import {Mesh} from 'three/src/objects/Mesh';
class MergeSopParamsConfig extends NodeParamsConfig {
	compact = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new MergeSopParamsConfig();

export class MergeSopNode extends TypedSopNode<MergeSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'merge';
	}

	static displayed_input_names(): string[] {
		return [INPUT_NAME, INPUT_NAME, INPUT_NAME, INPUT_NAME];
	}

	initialize_node() {
		this.io.inputs.set_count(1, 4);

		this.ui_data.set_width(100);
		// this.ui_data.set_icon('compress-arrows-alt');
		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created(() => {
				this.params.label.init([this.p.compact], () => {
					return this.pv.compact ? 'compact' : 'separate objects';
				});
			});
		});
	}

	cook(input_contents: CoreGroup[]) {
		let all_objects: Object3DWithGeometry[] = []; //new Group()
		for (let input_core_group of input_contents) {
			if (input_core_group) {
				const objects = input_core_group.objects();
				for (let object of objects) {
					object.traverse((child) => {
						all_objects.push(child as Object3DWithGeometry);
					});
				}
			}
		}
		if (this.pv.compact) {
			all_objects = this._make_compact(all_objects);
		}
		for (let object of all_objects) {
			object.traverse((o) => {
				o.matrixAutoUpdate = false;
			});
		}
		this.set_objects(all_objects);
	}

	_make_compact(all_objects: Object3DWithGeometry[]): Object3DWithGeometry[] {
		const materials_by_object_type: Map<ObjectType, Material> = new Map();
		const objects_by_type: Map<ObjectType, Object3DWithGeometry[]> = new Map();
		objects_by_type.set(ObjectType.MESH, []);
		objects_by_type.set(ObjectType.POINTS, []);
		objects_by_type.set(ObjectType.LINE_SEGMENTS, []);
		const ordered_object_types: ObjectType[] = [];

		for (let object of all_objects) {
			object.traverse((object3d: Object3D) => {
				const object = object3d as Object3DWithGeometry;
				if (object.geometry) {
					const object_type = object_type_from_constructor(object.constructor);
					if (!ordered_object_types.includes(object_type)) {
						ordered_object_types.push(object_type);
					}
					if (object_type) {
						const found_mat = materials_by_object_type.get(object_type);
						if (!found_mat) {
							materials_by_object_type.set(object_type, (object as Mesh).material as Material);
						}
						MapUtils.push_on_array_at_entry(objects_by_type, object_type, object);
					}
				}
			});
		}

		const merged_objects: Object3DWithGeometry[] = [];
		ordered_object_types.forEach((object_type) => {
			const objects = objects_by_type.get(object_type);
			if (objects) {
				const geometries = [];
				for (let object of objects) {
					const geometry = object.geometry;
					geometry.applyMatrix4(object.matrix);
					geometries.push(geometry);
				}

				// TODO: test that this works with geometries with same attributes
				const merged_geometry = CoreGeometry.merge_geometries(geometries);
				if (merged_geometry) {
					const material = materials_by_object_type.get(object_type);
					const object = this.create_object(merged_geometry, object_type, material);
					merged_objects.push(object as Object3DWithGeometry);
				}
			}
		});

		return merged_objects;
	}
}
