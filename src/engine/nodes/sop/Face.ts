import {Vector3} from 'three/src/math/Vector3';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {Mesh} from 'three/src/objects/Mesh';
import lodash_range from 'lodash/range';
import lodash_times from 'lodash/times';
import lodash_chunk from 'lodash/chunk';
import {TypedSopNode} from './_Base';
import {CoreGroup} from 'src/core/geometry/Group';
import {InputCloneMode} from 'src/engine/poly/InputCloneMode';

import {NodeParamsConfig, ParamConfig} from 'src/engine/nodes/utils/params/ParamsConfig';
import {CorePoint} from 'src/core/geometry/Point';
import {CoreFace} from 'src/core/geometry/Face';
class FaceSopParamsConfig extends NodeParamsConfig {
	make_faces_unique = ParamConfig.BOOLEAN(0);
	add_face_center_attribute = ParamConfig.BOOLEAN(0, {
		visible_if: {make_faces_unique: 1},
	});
	add_face_id = ParamConfig.BOOLEAN(0, {
		visible_if: {make_faces_unique: 1},
	});
	transform = ParamConfig.BOOLEAN(0, {
		visible_if: {make_faces_unique: 1},
	});
	scale = ParamConfig.FLOAT(1, {
		visible_if: {make_faces_unique: 1, transform: 1},
	});
}
const ParamsConfig = new FaceSopParamsConfig();

export class FaceSopNode extends TypedSopNode<FaceSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'face';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.FROM_NODE]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		if (this.pv.make_faces_unique) {
			this._make_faces_unique(core_group);

			// we can only add face_center attrib
			// if the faces have been split
			// otherwise a point may belong to multiple faces
			if (this.pv.add_face_center_attribute) {
				this._add_face_center_attribute(core_group);
			}
			if (this.pv.add_face_id) {
				this._add_face_id(core_group);
			}
			if (this.pv.transform) {
				this._transform_faces(core_group);
			}
		}

		this.set_core_group(core_group);
	}

	private _make_faces_unique(core_group: CoreGroup) {
		for (let object of core_group.objects()) {
			if ((object as Mesh).isMesh) {
				const geometry = (object as Mesh).geometry as BufferGeometry;
				const faces = lodash_chunk(geometry.index?.array || [], 3);
				const points_count = faces.length * 3;
				for (let attrib_name of Object.keys(geometry.attributes)) {
					const attrib = geometry.attributes[attrib_name];
					const attrib_size = attrib.itemSize;
					const new_values = new Float32Array(points_count * attrib_size);
					let new_value_index = 0;
					faces.forEach((face) => {
						face.forEach((index) => {
							lodash_times(attrib_size, (i) => {
								const current_value = attrib.array[index * attrib_size + i];
								new_values[new_value_index] = current_value;
								new_value_index += 1;
							});
						});
					});
					geometry.setAttribute(attrib_name, new BufferAttribute(new_values, attrib_size));
				}
				const new_indices = lodash_range(points_count);
				geometry.setIndex(new_indices);
			}
		}
	}

	private _add_face_center_attribute(core_group: CoreGroup) {
		const attrib_name = 'face_center';
		const face_center = new Vector3();
		let faces: CoreFace[], face: CoreFace, points: CorePoint[], point: CorePoint;

		core_group.core_objects().forEach((core_object) => {
			const object = core_object.object();
			const core_geometry = core_object.core_geometry();
			if ((object as Mesh).isMesh) {
				faces = core_geometry.faces();
				if (!core_geometry.has_attrib(attrib_name)) {
					core_geometry.add_numeric_attrib(attrib_name, 3, -1);
				}

				for (let fi = 0; fi < faces.length; fi++) {
					face = faces[fi];
					face.center(face_center);

					points = face.points;
					for (let pi = 0; pi < points.length; pi++) {
						point = points[pi];
						point.set_attrib_value(attrib_name, face_center);
					}
				}
			}
		});
	}

	private _add_face_id(core_group: CoreGroup) {
		const attrib_name = 'face_id';

		core_group.core_objects().forEach((core_object) => {
			const object = core_object.object();
			const core_geometry = core_object.core_geometry();
			if ((object as Mesh).isMesh) {
				const faces = core_geometry.faces();
				// const points_count = core_geometry.points_count();

				if (!core_geometry.has_attrib(attrib_name)) {
					core_geometry.add_numeric_attrib(attrib_name, 1, -1);
				}

				for (let i = 0; i < faces.length; i++) {
					const face = faces[i];
					const points = face.points;
					for (let j = 0; j < points.length; j++) {
						const point = points[j];
						point.set_attrib_value(attrib_name, i);
					}
				}
			}
		});
	}

	private _transform_faces(core_group: CoreGroup) {
		const attrib_name = 'position';
		const face_center = new Vector3();
		const new_position = new Vector3();
		const scale = this.pv.scale;
		let faces: CoreFace[], face: CoreFace, points: CorePoint[], point: CorePoint;

		core_group.core_objects().forEach((core_object) => {
			const object = core_object.object();
			const core_geometry = core_object.core_geometry();
			if ((object as Mesh).isMesh) {
				faces = core_geometry.faces();
				if (!core_geometry.has_attrib(attrib_name)) {
					core_geometry.add_numeric_attrib(attrib_name, 3, -1);
				}

				for (let fi = 0; fi < faces.length; fi++) {
					face = faces[fi];
					face.center(face_center);

					points = face.points;
					for (let pi = 0; pi < points.length; pi++) {
						point = points[pi];
						const position = point.position();
						new_position.x = position.x * scale + face_center.x * (1 - scale);
						new_position.y = position.y * scale + face_center.y * (1 - scale);
						new_position.z = position.z * scale + face_center.z * (1 - scale);
						point.set_attrib_value(attrib_name, new_position);
					}
				}
			}
		});
	}
}
