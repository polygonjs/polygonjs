import {BufferGeometry, Float32BufferAttribute} from 'three';
import {CoreGeometry} from '../Geometry';
import {Vector2} from 'three';
import {ArrayUtils} from '../../ArrayUtils';

export class CoreGeometryOperationSkin {
	constructor(
		private geometry: BufferGeometry,
		private geometry1: BufferGeometry,
		private geometry0: BufferGeometry
	) {}

	process() {
		const core_geometry0 = new CoreGeometry(this.geometry0);
		const core_geometry1 = new CoreGeometry(this.geometry1);
		const segments0 = core_geometry0.segments();
		const segments1 = core_geometry1.segments();

		if (segments0.length === 0 || segments1.length === 0) {
			return;
		}
		// find smallest geo to iterate on its array
		const geometries_by_segments_count =
			segments0.length < segments1.length ? [core_geometry0, core_geometry1] : [core_geometry1, core_geometry0];

		const smallest_geometry = geometries_by_segments_count[0];
		const largest_geometry = geometries_by_segments_count[1];

		const smallest_segments = smallest_geometry.segments();
		const largest_segments = largest_geometry.segments();

		const smallest_points = smallest_geometry.points();
		const largest_points = largest_geometry.points();
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

		const attributes_in_common = ArrayUtils.intersection(
			smallest_geometry.attribNames(),
			largest_geometry.attribNames()
		);
		// const points = all_points //points_indices.map(index=> all_points[index]);
		attributes_in_common.forEach((attrib_name) => {
			const attrib_size = smallest_geometry.attribSize(attrib_name);
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
