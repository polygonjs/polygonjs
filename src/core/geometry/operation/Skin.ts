import {Vector2, BufferGeometry, Float32BufferAttribute, Mesh} from 'three';
import {arrayChunk, arrayIntersection} from '../../ArrayUtils';
import {pointsFromObject} from '../entities/point/CorePointUtils';
import {ThreejsPoint} from '../modules/three/ThreejsPoint';

const dummyMeshSmallest = new Mesh();
const dummyMeshLargest = new Mesh();

function segments(geometry: BufferGeometry) {
	const index: Array<number> = (geometry.index?.array || []) as Array<number>;
	return arrayChunk(index, 2);
}
export class CoreGeometryOperationSkin {
	constructor(
		private geometry: BufferGeometry,
		private geometry1: BufferGeometry,
		private geometry0: BufferGeometry
	) {}

	process() {
		const segments0 = segments(this.geometry0);
		const segments1 = segments(this.geometry1);

		if (segments0.length === 0 || segments1.length === 0) {
			return;
		}
		// find smallest geo to iterate on its array
		const geometries_by_segments_count =
			segments0.length < segments1.length ? [this.geometry0, this.geometry1] : [this.geometry1, this.geometry0];

		const smallest_geometry = geometries_by_segments_count[0];
		const largest_geometry = geometries_by_segments_count[1];
		dummyMeshSmallest.geometry = smallest_geometry;
		dummyMeshLargest.geometry = largest_geometry;

		const smallest_segments = segments(smallest_geometry);
		const largest_segments = segments(largest_geometry);

		const smallest_points = pointsFromObject(dummyMeshSmallest);
		const largest_points = pointsFromObject(dummyMeshLargest);
		const smallestGeometryAttribNames = ThreejsPoint.attributeNames(dummyMeshSmallest);
		const largestGeometryAttribNames = ThreejsPoint.attributeNames(dummyMeshLargest);
		const smallest_points_count = smallest_points.length;
		// const largest_points_count = largest_points.length;
		const all_points = smallest_points.concat(largest_points);

		// const half_faces_count = smallest_segments.length;
		const points_indices: number[] = [];
		smallest_segments.forEach((segment, i) => {
			const matched_segment = largest_segments[i];
			// face 1
			points_indices.push(segment[0]);
			points_indices.push(segment[1]);
			points_indices.push(matched_segment[0] + smallest_points_count);
			// face 2
			points_indices.push(segment[1]);
			points_indices.push(matched_segment[1] + smallest_points_count);
			points_indices.push(matched_segment[0] + smallest_points_count);
		});

		const attributes_in_common: string[] = [];
		arrayIntersection(smallestGeometryAttribNames, largestGeometryAttribNames, attributes_in_common);
		// const points = all_points //points_indices.map(index=> all_points[index]);
		attributes_in_common.forEach((attrib_name) => {
			const attrib_size = ThreejsPoint.attribSize(dummyMeshSmallest, attrib_name);
			let attrib_values = all_points.map((point) => point.attribValue(attrib_name));
			let float_values: number[];
			if (attrib_size == 1) {
				float_values = attrib_values as number[];
			} else {
				float_values = attrib_values.map((v) => (v as Vector2).toArray()).flat();
			}
			this.geometry.setAttribute(attrib_name, new Float32BufferAttribute(float_values, attrib_size));
		});

		this.geometry.setIndex(points_indices);
		this.geometry.computeVertexNormals();
	}
}
