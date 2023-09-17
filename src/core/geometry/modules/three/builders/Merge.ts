import {BufferGeometry, Mesh} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';
import {CoreGeometryIndexBuilder} from '../../../util/IndexBuilder';
import {PolyDictionary} from '../../../../../types/GlobalTypes';
import {pointsFromBufferGeometry} from '../CoreThreejsPointUtils';
import {ThreejsPoint} from '../ThreejsPoint';

const dummyMesh = new Mesh();
export class CoreGeometryBuilderMerge {
	static merge(geometries: BufferGeometry[]) {
		if (geometries.length === 0) {
			return;
		}

		//
		// 1/4. add indices if none
		//
		for (let geometry of geometries) {
			CoreGeometryIndexBuilder.createIndexIfNone(geometry);
		}

		//
		// 2/4. set the new attrib indices for the indexed attributes
		//
		// const core_geometries = geometries.map((geometry) => new CoreGeometry(geometry));
		dummyMesh.geometry = geometries[0];
		const indexed_attribute_names = ThreejsPoint.indexedAttributeNames(dummyMesh);

		const new_values_by_attribute_name: PolyDictionary<string[]> = {};
		for (let indexed_attribute_name of indexed_attribute_names) {
			const index_by_values: PolyDictionary<number> = {};
			const all_geometries_points = [];
			for (let geometry of geometries) {
				const points = pointsFromBufferGeometry(geometry);
				for (let point of points) {
					all_geometries_points.push(point);
					const value: string | null = point.indexedAttribValue(indexed_attribute_name);
					//value_index = point.attribValueIndex(indexed_attribute_name)
					// TODO: typescript: that doesn't seem right
					if (value) {
						index_by_values[value] != null
							? index_by_values[value]
							: (index_by_values[value] = Object.keys(index_by_values).length);
					}
				}
			}

			const values = Object.keys(index_by_values);
			for (let point of all_geometries_points) {
				const value = point.indexedAttribValue(indexed_attribute_name);
				if (value) {
					const new_index = index_by_values[value];
					point.setAttribIndex(indexed_attribute_name, new_index);
				}
			}

			new_values_by_attribute_name[indexed_attribute_name] = values;
		}

		//
		// 3/4. merge the geos
		//
		const mergedGeometry = mergeGeometries(geometries);

		//
		// 4/4. add the index attrib values
		//

		// const merged_core_geometry = new CoreGeometry(mergedGeometry);
		dummyMesh.geometry = mergedGeometry;
		Object.keys(new_values_by_attribute_name).forEach((indexed_attribute_name) => {
			const values = new_values_by_attribute_name[indexed_attribute_name];
			ThreejsPoint.setIndexedAttributeValues(dummyMesh, indexed_attribute_name, values);
		});

		if (mergedGeometry) {
			delete mergedGeometry.userData.mergedUserData;
		}

		return mergedGeometry;
	}
}
