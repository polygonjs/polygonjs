import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
const THREE = {BufferAttribute, BufferGeometry};
import lodash_range from 'lodash/range';
import lodash_isNumber from 'lodash/isNumber';
import lodash_sortBy from 'lodash/sortBy';
import {TypedSopNode} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {CoreConstant} from '../../../core/geometry/Constant';
import {CoreMath} from '../../../core/math/_Module';
import {CoreIterator} from '../../../core/Iterator';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {InputCloneMode} from '../../poly/InputCloneMode';
class ScatterSopParamsConfig extends NodeParamsConfig {
	points_count = ParamConfig.INTEGER(100, {
		range: [0, 100],
		range_locked: [true, false],
	});
	seed = ParamConfig.INTEGER(0, {
		range: [0, 100],
		range_locked: [false, false],
	});
	transfer_attributes = ParamConfig.BOOLEAN(0);
	attributes_to_transfer = ParamConfig.STRING('normal', {
		visible_if: {transfer_attributes: 1},
	});
	add_id_attribute = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new ScatterSopParamsConfig();

export class ScatterSopNode extends TypedSopNode<ScatterSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'scatter';
	}

	// private _positions: number[];
	// private _areas_thresholds: number[];
	// private _attrib_values_by_name = {};
	// private _area_sum: number;

	static displayed_input_names(): string[] {
		return ['geometry to scatter points onto'];
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_clonable_state([InputCloneMode.NEVER]);
	}

	async cook(input_contents: CoreGroup[]) {
		// const objects = input_contents[0] //.group({clone: false})
		const core_group = input_contents[0]; //CoreGroup.from_objects(objects)
		let faces = core_group.faces();
		// const areas_by_face_index = []
		const areas_thresholds: number[] = [];
		let area_sum = 0;
		const area_by_face_index: Map<number, number> = new Map();

		for (let face of faces) {
			const area = face.area;
			area_by_face_index.set(face.index, area);
		}
		const sorted_faces = lodash_sortBy(faces, (f) => {
			return area_by_face_index.get(f.index);
		});

		let i = 0;
		for (let face of sorted_faces) {
			area_sum += area_by_face_index.get(face.index) as number;
			areas_thresholds[i] = area_sum;
			i++;
		}

		const positions: number[] = [];
		let attrib_names: string[] = [];
		if (this.pv.transfer_attributes) {
			attrib_names = core_group.attrib_names_matching_mask(this.pv.attributes_to_transfer);
		}

		const attrib_values_by_name: Map<string, number[]> = new Map();
		const attrib_sizes_by_name: Map<string, number> = new Map();
		for (let attrib_name of attrib_names) {
			attrib_values_by_name.set(attrib_name, []);
			attrib_sizes_by_name.set(attrib_name, core_group.attrib_size(attrib_name));
		}

		const iterator = new CoreIterator();
		// await iterator.start_with_count(this.pv.points_count, this._add_point.bind(this))
		await iterator.start_with_count(this.pv.points_count, (point_index: number) => {
			const rand = CoreMath.rand_float(this.pv.seed + point_index) * area_sum;

			for (let face_index = 0; face_index < areas_thresholds.length; face_index++) {
				const areas_threshold = areas_thresholds[face_index];

				if (rand <= areas_threshold) {
					const face = sorted_faces[face_index];
					const position = face.random_position(rand);
					position.toArray(positions, positions.length);

					for (let attrib_name of attrib_names) {
						const attrib_value = face.attrib_value_at_position(attrib_name, position);
						if (lodash_isNumber(attrib_value)) {
							attrib_values_by_name.get(attrib_name)!.push(attrib_value);
						} else {
							attrib_value.toArray(
								attrib_values_by_name.get(attrib_name),
								attrib_values_by_name.get(attrib_name)!.length
							);
						}
					}

					break;
				}
			}
		});

		// for(let point_index=0; point_index<this.pv.points_count; point_index++){

		// 	const rand = CoreMath.rand_float(this.pv.seed+point_index) * area_sum

		// 	for(let face_index=0; face_index<areas_thresholds.length; face_index++){

		// 		const areas_threshold = areas_thresholds[face_index]

		// 		if(rand <= areas_threshold){
		// 			const face = sorted_faces[face_index]
		// 			const position = face.random_position(rand)
		// 			position.toArray(positions, positions.length)

		// 			for(let attrib_name of attrib_names){
		// 				const attrib_value = face.attrib_value_at_position(attrib_name, position)
		// 				if (lodash_isNumber(attrib_value)){
		// 					attrib_values_by_name[attrib_name].push(attrib_value)
		// 				} else {
		// 					attrib_value.toArray(
		// 						attrib_values_by_name[attrib_name],
		// 						attrib_values_by_name[attrib_name].length
		// 					)
		// 				}
		// 			}

		// 			break;
		// 		}
		// 	}
		// }

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
		for (let attrib_name of attrib_names) {
			geometry.setAttribute(
				attrib_name,
				new THREE.BufferAttribute(
					new Float32Array(attrib_values_by_name.get(attrib_name)!),
					attrib_sizes_by_name.get(attrib_name)!
				)
			);
		}

		if (this.pv.add_id_attribute) {
			const ids = lodash_range(this.pv.points_count);
			geometry.setAttribute('id', new THREE.BufferAttribute(new Float32Array(ids), 1));
		}

		this.set_geometry(geometry, CoreConstant.OBJECT_TYPE.POINTS);
	}

	// private _add_point(point_index: number) {
	// 	const rand = CoreMath.rand_float(this.pv.seed + point_index) * this._area_sum;

	// 	for (let face_index = 0; face_index < this._areas_thresholds.length; face_index++) {
	// 		const areas_threshold = this._areas_thresholds[face_index];

	// 		if (rand <= areas_threshold) {
	// 			const face = this._sorted_faces[face_index];
	// 			const position = face.random_position(rand);
	// 			position.toArray(positions, positions.length);

	// 			for (let attrib_name of attrib_names) {
	// 				const attrib_value = face.attrib_value_at_position(attrib_name, position);
	// 				if (lodash_isNumber(attrib_value)) {
	// 					this._attrib_values_by_name[attrib_name].push(attrib_value);
	// 				} else {
	// 					attrib_value.toArray(
	// 						this._attrib_values_by_name[attrib_name],
	// 						this._attrib_values_by_name[attrib_name].length
	// 					);
	// 				}
	// 			}

	// 			break;
	// 		}
	// 	}
	// }
}
