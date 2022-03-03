import {CorePoint} from '../Point';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreGeometry} from '../Geometry';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {Vector3} from 'three/src/math/Vector3';
import {ArrayUtils} from '../../ArrayUtils';
import {PolyDictionary} from '../../../types/GlobalTypes';

export abstract class CoreGeometryBuilderBase {
	from_points(points: CorePoint[]) {
		points = this._filter_points(points);
		const geometry = new BufferGeometry();
		const core_geometry = new CoreGeometry(geometry);

		const first_point = points[0];
		if (first_point != null) {
			const old_geometry = first_point.geometry();
			const old_core_geometry = first_point.coreGeometry();

			// index
			const new_index_by_old_index: PolyDictionary<number> = {};
			for (let i = 0; i < points.length; i++) {
				new_index_by_old_index[points[i].index()] = i;
			}

			const indices = this._indices_from_points(new_index_by_old_index, old_geometry);
			if (indices) {
				geometry.setIndex(indices);
			}

			// attributes
			const {attributes} = old_geometry;
			// const new_attributes = {}
			for (let attribute_name of Object.keys(attributes)) {
				const attrib_values = old_core_geometry.userDataAttribs()[attribute_name];
				const is_attrib_indexed = attrib_values != null;

				if (is_attrib_indexed) {
					const new_values: string[] = ArrayUtils.uniqWithoutPreservingOrder(
						points.map((point) => point.indexedAttribValue(attribute_name))
					);
					const new_index_by_value: PolyDictionary<number> = {};
					new_values.forEach((new_value, i) => (new_index_by_value[new_value] = i));

					core_geometry.userDataAttribs()[attribute_name] = new_values;

					// const old_attrib = old_geometry.getAttribute(attribute_name)
					// const old_attrib_array = old_attrib.array
					const new_attrib_indices = [];
					for (let point of points) {
						// const old_index = old_attrib_array[point.index()]
						const new_index = new_index_by_value[point.indexedAttribValue(attribute_name)];
						new_attrib_indices.push(new_index);
					}

					geometry.setAttribute(attribute_name, new Float32BufferAttribute(new_attrib_indices, 1));
				} else {
					const attrib_size = attributes[attribute_name].itemSize;
					const values: number[] = new Array(points.length * attrib_size);
					switch (attrib_size) {
						case 1:
							for (let i = 0; i < points.length; i++) {
								values[i] = points[i].attribValue(attribute_name) as number;
							}
							break;
						default:
							let value: Vector3;
							for (let i = 0; i < points.length; i++) {
								value = points[i].attribValue(attribute_name) as Vector3;
								value.toArray(values, i * attrib_size);
							}
							break;
					}

					geometry.setAttribute(attribute_name, new Float32BufferAttribute(values, attrib_size));
				}
			}
		}
		return geometry;
	}

	protected abstract _filter_points(points: CorePoint[]): CorePoint[];
	protected abstract _indices_from_points(
		new_index_by_old_index: PolyDictionary<number>,
		old_geometry: BufferGeometry
	): number[] | undefined;
}
