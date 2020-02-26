// import lodash_times from 'lodash/times';
// import lodash_each from 'lodash/each';
// import lodash_difference from 'lodash/difference';
// import lodash_keys from 'lodash/keys';
// import {Object3D} from 'three/src/core/Object3D';
// import {Group} from 'three/src/objects/Group';
// import {BufferAttribute} from 'three/src/core/BufferAttribute';
// const THREE = {BufferAttribute, Group, Object3D};
import {TypedSopNode} from './_Base';
// import {ParamType} from '../../../Engine/Param/_Module';

// import {CoreGroup} from '../../../Core/Geometry/Group';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {Object3D} from 'three/src/core/Object3D';
// import {CoreConstant} from '../../../Core/Geometry/Constant';
import {ObjectType} from '../../../core/geometry/Constant';
import {Mesh} from 'three/src/objects/Mesh';
import {LineSegments} from 'three/src/objects/LineSegments';
import {Points} from 'three/src/objects/Points';
type ObjectsByType = {[key in ObjectType]: Object3DWithGeometry[]};
type ObjectTypes = Array<ObjectType>;

const INPUT_NAME = 'geometry to merge';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
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
		this.set_objects(all_objects);
	}

	_make_compact(all_objects: Object3DWithGeometry[]): Object3DWithGeometry[] {
		const objects_by_type: ObjectsByType = {
			[ObjectType.MESH]: [],
			[ObjectType.POINTS]: [],
			[ObjectType.LINE_SEGMENTS]: [],
		};
		const merged_objects: Object3DWithGeometry[] = [];

		for (let object of all_objects) {
			object.traverse((object3d: Object3D) => {
				const object = object3d as Object3DWithGeometry;
				if (object.geometry) {
					// const type = child.constructor.name;
					if ((object as Mesh).isMesh) {
						objects_by_type[ObjectType.MESH].push(object);
					} else {
						if ((object as LineSegments).isLineSegments) {
							objects_by_type[ObjectType.LINE_SEGMENTS].push(object);
						} else {
							if ((object as Points).isPoints) {
								objects_by_type[ObjectType.POINTS].push(object);
							}
						}
					}
				}
			});
		}

		for (let type of Object.keys(objects_by_type) as ObjectTypes) {
			const objects = objects_by_type[type];

			const geometries = [];
			for (let object of objects) {
				const geometry = object.geometry;
				geometry.applyMatrix(object.matrix);
				geometries.push(geometry);
			}

			// TODO: test that this works with geometries with same attributes
			const merged_geometry = CoreGeometry.merge_geometries(geometries);
			if (merged_geometry) {
				const object = this.create_object(merged_geometry, type);
				merged_objects.push(object);
			}

			// objects.forEach( object=> {
			// 	if (object.parent != null) {
			// 		object.parent.remove(object);
			// 	}
			// 	if (object.geometry != null) {
			// 		object.geometry.dispose();
			// 	}
			// 	(object.material != null ? object.material.dispose() : undefined);
			// });
		}
		return merged_objects;
	}
}

// _add_missing_attributes: (geo0, geo1)->
// 	geo0_attribute_names = lodash_keys(geo0.attributes)
// 	geo1_attribute_names = lodash_keys(geo1.attributes)

// 	attributes_not_in_geo0 = lodash_difference(geo1_attribute_names, geo0_attribute_names)
// 	attributes_not_in_geo1 = lodash_difference(geo0_attribute_names, geo1_attribute_names)

// 	lodash_each attributes_not_in_geo0, (attribute_not_in_geo0)=>
// 		this._add_attribute(geo0, attribute_not_in_geo0, geo1.attributes[attribute_not_in_geo0])
// 	lodash_each attributes_not_in_geo1, (attribute_not_in_geo1)=>
// 		this._add_attribute(geo1, attribute_not_in_geo1, geo0.attributes[attribute_not_in_geo1])

// _add_attribute: (geo, attrib_name, attribute_template)->

// 	item_size = attribute_template['itemSize']
// 	normalized = attribute_template['normalized']
// 	points_count = geo.getAttribute('position').array.length / 3

// 	raw_values = []
// 	lodash_times points_count, (i)->
// 		lodash_times item_size, (j)->
// 			raw_values.push(0)

// 	values = new Float32Array(raw_values)
// 	geo.setAttribute( attrib_name, new BufferAttribute( values, item_size, normalized) )
