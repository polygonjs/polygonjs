import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreGeometry} from '../Geometry';
import {BufferGeometryUtils} from '../../../../modules/three/examples/jsm/utils/BufferGeometryUtils';

export class CoreGeometryBuilderMerge {
	static merge(geometries: BufferGeometry[]) {
		if (geometries.length === 0) {
			return;
		}

		//
		// 1/3. set the new attrib indices for the indexed attributes
		//
		const core_geometries = geometries.map((geometry) => new CoreGeometry(geometry));
		const indexed_attribute_names = core_geometries[0].indexed_attribute_names();

		const new_values_by_attribute_name: Dictionary<string[]> = {};
		for (let indexed_attribute_name of indexed_attribute_names) {
			const index_by_values: Dictionary<number> = {};
			const all_geometries_points = [];
			for (let core_geometry of core_geometries) {
				const geometry_points = core_geometry.points();
				for (let point of geometry_points) {
					all_geometries_points.push(point);
					const value = point.attrib_value(indexed_attribute_name);
					//value_index = point.attrib_value_index(indexed_attribute_name)
					// TODO: typescript: that doesn't seem right
					index_by_values[value] != null
						? index_by_values[value]
						: (index_by_values[value] = Object.keys(index_by_values).length);
				}
			}

			const values = Object.keys(index_by_values);
			for (let point of all_geometries_points) {
				const value = point.attrib_value(indexed_attribute_name);
				const new_index = index_by_values[value];
				point.set_attrib_index(indexed_attribute_name, new_index);
			}

			new_values_by_attribute_name[indexed_attribute_name] = values;
		}

		//
		// 2/3. merge the geos
		//
		const merged_geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

		//
		// 3/3. add the index attrib values
		//

		const merged_geometry_wrapper = new CoreGeometry(merged_geometry);
		Object.keys(new_values_by_attribute_name).forEach((indexed_attribute_name) => {
			const values = new_values_by_attribute_name[indexed_attribute_name];
			merged_geometry_wrapper.set_indexed_attribute_values(indexed_attribute_name, values);
		});

		if (merged_geometry) {
			delete merged_geometry.userData.mergedUserData;
		}

		return merged_geometry;
	}
}
