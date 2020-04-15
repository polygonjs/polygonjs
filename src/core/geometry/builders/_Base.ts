import {CorePoint} from '../Point';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreGeometry} from '../Geometry';
import lodash_uniq from 'lodash/uniq';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';

export abstract class CoreGeometryBuilderBase {
	from_points(points: CorePoint[]) {
		points = this._filter_points(points);
		const geometry = new BufferGeometry();
		const core_geometry = new CoreGeometry(geometry);

		const first_point = points[0];
		if (first_point != null) {
			const old_geometry = first_point.geometry();
			const old_core_geometry = first_point.geometry_wrapper();

			// index
			const new_index_by_old_index: Dictionary<number> = {};
			for (let i = 0; i < points.length; i++) {
				new_index_by_old_index[points[i].index] = i;
			}

			const indices = this._indices_from_points(new_index_by_old_index, old_geometry);
			if (indices) {
				geometry.setIndex(indices);
			}

			// attributes
			const {attributes} = old_geometry;
			// const new_attributes = {}
			for (let attribute_name of Object.keys(attributes)) {
				const attrib_values = old_core_geometry.user_data_attribs()[attribute_name];
				const is_attrib_indexed = attrib_values != null;

				if (is_attrib_indexed) {
					const new_values = lodash_uniq(points.map((point) => point.attrib_value(attribute_name)));
					const new_index_by_value: Dictionary<number> = {};
					new_values.forEach((new_value, i) => (new_index_by_value[new_value] = i));

					core_geometry.user_data_attribs()[attribute_name] = new_values;

					// const old_attrib = old_geometry.getAttribute(attribute_name)
					// const old_attrib_array = old_attrib.array
					const new_attrib_indices = [];
					for (let point of points) {
						// const old_index = old_attrib_array[point.index()]
						const new_index = new_index_by_value[point.attrib_value(attribute_name)];
						new_attrib_indices.push(new_index);
					}

					geometry.setAttribute(attribute_name, new Float32BufferAttribute(new_attrib_indices, 1));
				} else {
					const values = [];
					const attrib_size = attributes[attribute_name].itemSize;
					for (let point of points) {
						const value = point.attrib_value(attribute_name);
						switch (attrib_size) {
							case 1:
								values.push(value);
								break;
							case 3:
								values.push(value.x);
								values.push(value.y);
								values.push(value.z);
								break;
						}
					}

					geometry.setAttribute(attribute_name, new Float32BufferAttribute(values, attrib_size));
				}
			}
		}
		return geometry;
	}

	protected abstract _filter_points(points: CorePoint[]): CorePoint[];
	protected abstract _indices_from_points(
		new_index_by_old_index: Dictionary<number>,
		old_geometry: BufferGeometry
	): number[] | undefined;
}
