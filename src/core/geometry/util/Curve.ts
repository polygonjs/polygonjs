import {CoreGeometry} from '../Geometry';
import {CorePoint} from '../Point';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Vector2} from 'three/src/math/Vector2';

export class CoreGeometryUtilCurve {
	static accumulated_curve_point_indices(indices: number[]) {
		let curve_point_indices: number[] = [];
		const accumulated_curve_point_indices = [];
		let last_index_added: number | null = null;

		// indices.forEach((index, i) => {
		let index: number;
		for (let i = 0; i < indices.length; i++) {
			if (i % 2 === 1) {
				index = indices[i];
				const previous_index = indices[i - 1];

				// if the last added index, from the previous segment
				// is the same as the start of the current segment (indices[i-1])
				// then this is part of the same curve
				if (last_index_added == null || previous_index === last_index_added) {
					// add the first point
					if (curve_point_indices.length === 0) {
						curve_point_indices.push(previous_index);
					}

					curve_point_indices.push(index);
					last_index_added = index;
				} else {
					// otherwise we create a new curve
					accumulated_curve_point_indices.push(curve_point_indices);

					// and reset the array
					curve_point_indices = [previous_index, index];
					last_index_added = index;
				}
			}
		}

		// also create with the remaining ones
		accumulated_curve_point_indices.push(curve_point_indices);

		return accumulated_curve_point_indices;
	}

	static create_line_segment_geometry(
		points: CorePoint[],
		indices: number[],
		attrib_names: string[],
		attrib_sizes_by_name: Dictionary<number>
	) {
		// let new_positions: number[] = []
		const new_indices: number[] = [];

		const new_attribute_values_by_name: Dictionary<number[]> = {};
		attrib_names.forEach((attrib_name) => {
			new_attribute_values_by_name[attrib_name] = [];
		});

		indices.forEach((index, i) => {
			const point = points[index];
			// const position = point.position();
			// new_positions.push(position.toArray());
			attrib_names.forEach((attrib_name) => {
				const attrib_value = point.attrib_value(attrib_name);
				const attrib_size = attrib_sizes_by_name[attrib_name];
				let attrib_value_f: number[];
				if (attrib_size > 1) {
					attrib_value_f = (attrib_value as Vector2).toArray();
				} else {
					attrib_value_f = [attrib_value as number];
				}
				attrib_value_f.forEach((v: number) => {
					new_attribute_values_by_name[attrib_name].push(v);
				});
			});

			if (i > 0) {
				new_indices.push(i - 1);
				new_indices.push(i);
			}
		});

		const geometry = new BufferGeometry();

		attrib_names.forEach((attrib_name) => {
			const attrib_size = attrib_sizes_by_name[attrib_name];
			const values = new_attribute_values_by_name[attrib_name];
			geometry.setAttribute(attrib_name, new Float32BufferAttribute(values, attrib_size));
		});

		geometry.setIndex(new_indices);
		return geometry;
	}

	static line_segment_to_geometries(geometry: BufferGeometry) {
		const geometries: BufferGeometry[] = [];
		const core_geometry = new CoreGeometry(geometry);
		const attrib_names = core_geometry.attrib_names();
		const points = core_geometry.points();
		const indices = (geometry.getIndex()?.array as number[]) || [];

		const accumulated_curve_point_indices = this.accumulated_curve_point_indices(indices);

		if (accumulated_curve_point_indices.length > 0) {
			const attribute_sizes_by_name = core_geometry.attrib_sizes();

			accumulated_curve_point_indices.forEach((curve_point_indices, i) => {
				geometry = this.create_line_segment_geometry(
					points,
					curve_point_indices,
					attrib_names,
					attribute_sizes_by_name
				);
				geometries.push(geometry);
			});
		}

		return geometries;
	}
}
