import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../geometry/Group';
import {DefaultOperationParams} from '../_Base';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import lodash_sortBy from 'lodash/sortBy';
import {ObjectType} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CoreIterator} from '../../Iterator';
import {CoreMath} from '../../math/_Module';
import { CoreType } from '../../Type';
import { ArrayUtils } from '../../ArrayUtils';

interface ScatterSopParams extends DefaultOperationParams {
	points_count: number;
	seed: number;
	transfer_attributes: boolean;
	attributes_to_transfer: string;
	add_id_attribute: boolean;
	add_idn_attribute: boolean;
}

export class ScatterSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ScatterSopParams = {
		points_count: 100,
		seed: 0,
		transfer_attributes: true,
		attributes_to_transfer: 'normal',
		add_id_attribute: true,
		add_idn_attribute: true,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'scatter'> {
		return 'scatter';
	}

	async cook(input_contents: CoreGroup[], params: ScatterSopParams) {
		const core_group = input_contents[0];
		let faces = core_group.faces();
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
		if (params.transfer_attributes) {
			attrib_names = core_group.attrib_names_matching_mask(params.attributes_to_transfer);
		}

		const attrib_values_by_name: Map<string, number[]> = new Map();
		const attrib_sizes_by_name: Map<string, number> = new Map();
		for (let attrib_name of attrib_names) {
			attrib_values_by_name.set(attrib_name, []);
			attrib_sizes_by_name.set(attrib_name, core_group.attrib_size(attrib_name));
		}

		const iterator = new CoreIterator();
		// await iterator.start_with_count(params.points_count, this._add_point.bind(this))
		await iterator.start_with_count(params.points_count, (point_index: number) => {
			const rand = CoreMath.rand_float(params.seed + point_index) * area_sum;

			for (let face_index = 0; face_index < areas_thresholds.length; face_index++) {
				const areas_threshold = areas_thresholds[face_index];

				if (rand <= areas_threshold) {
					const face = sorted_faces[face_index];
					const position = face.random_position(rand);
					position.toArray(positions, positions.length);

					for (let attrib_name of attrib_names) {
						const attrib_value = face.attrib_value_at_position(attrib_name, position);
						if (attrib_value) {
							if (CoreType.isNumber(attrib_value)) {
								attrib_values_by_name.get(attrib_name)!.push(attrib_value);
							} else {
								attrib_value.toArray(
									attrib_values_by_name.get(attrib_name),
									attrib_values_by_name.get(attrib_name)!.length
								);
							}
						}
					}

					break;
				}
			}
		});

		// for(let point_index=0; point_index<params.points_count; point_index++){

		// 	const rand = CoreMath.rand_float(params.seed+point_index) * area_sum

		// 	for(let face_index=0; face_index<areas_thresholds.length; face_index++){

		// 		const areas_threshold = areas_thresholds[face_index]

		// 		if(rand <= areas_threshold){
		// 			const face = sorted_faces[face_index]
		// 			const position = face.random_position(rand)
		// 			position.toArray(positions, positions.length)

		// 			for(let attrib_name of attrib_names){
		// 				const attrib_value = face.attrib_value_at_position(attrib_name, position)
		// 				if (CoreType.isNumber(attrib_value)){
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

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
		for (let attrib_name of attrib_names) {
			geometry.setAttribute(
				attrib_name,
				new BufferAttribute(
					new Float32Array(attrib_values_by_name.get(attrib_name)!),
					attrib_sizes_by_name.get(attrib_name)!
				)
			);
		}

		if (params.add_id_attribute || params.add_idn_attribute) {
			const points_count = params.points_count;
			const ids = ArrayUtils.range(points_count);
			if (params.add_id_attribute) {
				geometry.setAttribute('id', new BufferAttribute(new Float32Array(ids), 1));
			}
			const idns = ids.map((id) => id / (points_count - 1));
			if (params.add_idn_attribute) {
				geometry.setAttribute('idn', new BufferAttribute(new Float32Array(idns), 1));
			}
		}

		const object = this.create_object(geometry, ObjectType.POINTS);

		return this.create_core_group_from_objects([object]);
	}
}
