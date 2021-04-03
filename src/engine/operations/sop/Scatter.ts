import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {DefaultOperationParams} from '../_Base';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {BufferAttribute} from 'three/src/core/BufferAttribute';
import {ObjectType} from '../../../core/geometry/Constant';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {CoreIterator} from '../../../core/Iterator';
import {CoreMath} from '../../../core/math/_Module';
import {CoreType} from '../../../core/Type';
import {ArrayUtils} from '../../../core/ArrayUtils';
import {isBooleanTrue} from '../../../core/BooleanValue';

interface ScatterSopParams extends DefaultOperationParams {
	pointsCount: number;
	seed: number;
	transferAttributes: boolean;
	attributesToTransfer: string;
	addIdAttribute: boolean;
	addIdnAttribute: boolean;
}

export class ScatterSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: ScatterSopParams = {
		pointsCount: 100,
		seed: 0,
		transferAttributes: true,
		attributesToTransfer: 'normal',
		addIdAttribute: true,
		addIdnAttribute: true,
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
			const area = face.area();
			area_by_face_index.set(face.index(), area);
		}
		const sorted_faces = ArrayUtils.sortBy(faces, (f) => {
			return area_by_face_index.get(f.index()) || -1;
		});

		let i = 0;
		for (let face of sorted_faces) {
			area_sum += area_by_face_index.get(face.index()) as number;
			areas_thresholds[i] = area_sum;
			i++;
		}

		const positions: number[] = [];
		let attrib_names: string[] = [];
		if (isBooleanTrue(params.transferAttributes)) {
			attrib_names = core_group.attribNamesMatchingMask(params.attributesToTransfer);
		}

		const attrib_values_by_name: Map<string, number[]> = new Map();
		const attrib_sizes_by_name: Map<string, number> = new Map();
		for (let attrib_name of attrib_names) {
			attrib_values_by_name.set(attrib_name, []);
			attrib_sizes_by_name.set(attrib_name, core_group.attribSize(attrib_name));
		}

		const iterator = new CoreIterator();
		const baseSeed = (2454 * params.seed) % Number.MAX_SAFE_INTEGER;
		await iterator.startWithCount(params.pointsCount, (point_index: number) => {
			const rand = CoreMath.randFloat(baseSeed + point_index) * area_sum;

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

		// for(let point_index=0; point_index<params.pointsCount; point_index++){

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

		if (isBooleanTrue(params.addIdAttribute) || isBooleanTrue(params.addIdnAttribute)) {
			const pointsCount = params.pointsCount;
			const ids = ArrayUtils.range(pointsCount);
			if (isBooleanTrue(params.addIdAttribute)) {
				geometry.setAttribute('id', new BufferAttribute(new Float32Array(ids), 1));
			}
			const idns = ids.map((id) => id / (pointsCount - 1));
			if (isBooleanTrue(params.addIdnAttribute)) {
				geometry.setAttribute('idn', new BufferAttribute(new Float32Array(idns), 1));
			}
		}

		const object = this.createObject(geometry, ObjectType.POINTS);

		return this.createCoreGroupFromObjects([object]);
	}
}
