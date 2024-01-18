import {BufferGeometry, Mesh} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';
import {CoreGeometryIndexBuilder} from '../../../util/IndexBuilder';
import {PolyDictionary} from '../../../../../types/GlobalTypes';
import {pointsFromThreejsObject} from '../CoreThreejsPointUtils';
import {ThreejsPoint} from '../ThreejsPoint';
import {setToArray} from '../../../../SetUtils';

const dummyMesh = new Mesh();
export class CoreGeometryBuilderMerge {
	static merge(geometries: BufferGeometry[]) {
		if (geometries.length === 0) {
			return;
		}

		//
		// 1/4. add indices if none
		//
		for (const geometry of geometries) {
			CoreGeometryIndexBuilder.createIndexIfNone(geometry);
		}

		//
		// 2/4. set the new attrib indices for the indexed attributes
		//
		// const core_geometries = geometries.map((geometry) => new CoreGeometry(geometry));
		dummyMesh.geometry = geometries[0];
		const indexedAttributeNames = ThreejsPoint.indexedAttributeNames(dummyMesh);

		const newValuesByAttributeName: PolyDictionary<string[]> = {};
		for (const indexedAttributeName of indexedAttributeNames) {
			const indexByValues: Map<string, number> = new Map();
			const valuesSet: Set<string> = new Set();
			const allGeometriesPoints: ThreejsPoint[] = [];
			for (const geometry of geometries) {
				const dummyMesh = new Mesh(geometry);
				const points = pointsFromThreejsObject(dummyMesh);
				for (const point of points) {
					allGeometriesPoints.push(point);
					const value: string | null = point.indexedAttribValue(indexedAttributeName);

					if (value != null) {
						if (!valuesSet.has(value)) {
							indexByValues.set(value, valuesSet.size);
							valuesSet.add(value);
						}
					}
				}
			}

			for (const point of allGeometriesPoints) {
				const value = point.indexedAttribValue(indexedAttributeName);
				if (value != null) {
					const newIndex = indexByValues.get(value);
					if (newIndex != null) {
						point.setAttribIndex(indexedAttributeName, newIndex);
					}
				}
			}
			const values: string[] = [];
			setToArray(valuesSet, values);
			newValuesByAttributeName[indexedAttributeName] = values;
		}

		//
		// 3/4. merge the geos
		//
		const mergedGeometry = mergeGeometries(geometries);

		//
		// 4/4. add the index attrib values
		//

		dummyMesh.geometry = mergedGeometry;
		Object.keys(newValuesByAttributeName).forEach((indexedAttributeName) => {
			const values = newValuesByAttributeName[indexedAttributeName];
			ThreejsPoint.setIndexedAttributeValues(dummyMesh, indexedAttributeName, values);
		});

		if (mergedGeometry) {
			delete mergedGeometry.userData.mergedUserData;
		}

		return mergedGeometry;
	}
}
