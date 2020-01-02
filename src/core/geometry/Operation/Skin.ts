import {Float32BufferAttribute} from 'three/src/core/BufferAttribute'
import {BufferGeometry} from 'three/src/core/BufferGeometry'
import {CoreGeometry} from '../Geometry'
import lodash_range from 'lodash/range'
import lodash_flatten from 'lodash/flatten'
import lodash_intersection from 'lodash/intersection'
import lodash_concat from 'lodash/concat'

export class CoreGeometryOperationSkin {
	constructor(
		private geometry: BufferGeometry,
		private geometry1: BufferGeometry,
		private geometry0: BufferGeometry
	) {}

	process() {
		const geometry_wrapper0 = new CoreGeometry(this.geometry0)
		const geometry_wrapper1 = new CoreGeometry(this.geometry1)
		const segments0 = geometry_wrapper0.segments()
		const segments1 = geometry_wrapper1.segments()

		if (segments0.length === 0 || segments1.length === 0) {
			return
		}
		// find smallest geo to iterate on its array
		const geometries_by_segments_count =
			segments0.length < segments1.length
				? [geometry_wrapper0, geometry_wrapper1]
				: [geometry_wrapper1, geometry_wrapper0]

		const smallest_geometry = geometries_by_segments_count[0]
		const largest_geometry = geometries_by_segments_count[1]

		const smallest_segments = smallest_geometry.segments()
		const largest_segments = largest_geometry.segments()

		const smallest_points = smallest_geometry.points()
		const largest_points = largest_geometry.points()
		const smallest_points_count = smallest_points.length
		// const largest_points_count = largest_points.length;
		const all_points = lodash_concat(smallest_points, largest_points)

		// const half_faces_count = smallest_segments.length;
		const points_indices: number[] = []
		smallest_segments.forEach((segment, i) => {
			const matched_segment = largest_segments[i]
			// face 1
			points_indices.push(segment[0])
			points_indices.push(segment[1])
			points_indices.push(matched_segment[0] + smallest_points_count)
			// face 2
			points_indices.push(segment[1])
			points_indices.push(matched_segment[1] + smallest_points_count)
			points_indices.push(matched_segment[0] + smallest_points_count)
		})

		const attributes_in_common = lodash_intersection(
			smallest_geometry.attrib_names(),
			largest_geometry.attrib_names()
		)
		// const points = all_points //points_indices.map(index=> all_points[index]);
		attributes_in_common.forEach((attrib_name) => {
			const attrib_size = smallest_geometry.attrib_size(attrib_name)
			let attrib_values = all_points.map((point) =>
				point.attrib_value(attrib_name)
			)
			if (attrib_size > 1) {
				attrib_values = lodash_flatten(
					attrib_values.map((v) => v.toArray())
				)
			}
			this.geometry.setAttribute(
				attrib_name,
				new Float32BufferAttribute(attrib_values, attrib_size)
			)
		})

		// const new_indices = lodash_range(points.length);
		this.geometry.setIndex(points_indices)
		this.geometry.computeVertexNormals()
	}
}
