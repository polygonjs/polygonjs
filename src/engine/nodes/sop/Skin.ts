/**
 * Creates polygons between 2 lines
 *
 *
 */
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {Mesh} from 'three/src/objects/Mesh';
import {LineSegments} from 'three/src/objects/LineSegments';
import {TypedSopNode} from './_Base';
import {CoreGeometryUtilCurve} from '../../../core/geometry/util/Curve';
import {CoreGeometryOperationSkin} from '../../../core/geometry/operation/Skin';
import {CoreGroup} from '../../../core/geometry/Group';

import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ArrayUtils} from '../../../core/ArrayUtils';
class SkinSopParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new SkinSopParamsConfig();

export class SkinSopNode extends TypedSopNode<SkinSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'skin';
	}

	static displayedInputNames(): string[] {
		return ['lines to create polygons from', 'if used, lines from both inputs will be used'];
	}

	initializeNode() {
		this.io.inputs.setCount(1, 2);
	}

	cook(input_contents: CoreGroup[]) {
		const inputs_count = ArrayUtils.compact(this.io.inputs.inputs()).length;
		switch (inputs_count) {
			case 1:
				return this.process_one_input(input_contents);
			case 2:
				return this.process_two_inputs(input_contents);
			default:
				return this.states.error.set('inputs count not valid');
		}
	}

	process_one_input(input_contents: CoreGroup[]) {
		const core_group0 = input_contents[0];
		const line_segments0 = this._get_line_segments(core_group0);

		const geometries: BufferGeometry[] = [];
		if (line_segments0) {
			const first_line_segment = line_segments0[0] as Mesh;
			if (first_line_segment) {
				const src_geometries = CoreGeometryUtilCurve.line_segment_to_geometries(
					first_line_segment.geometry as BufferGeometry
				);
				src_geometries.forEach((src_geometry, i) => {
					if (i > 0) {
						const prev_src_geometry = src_geometries[i - 1];

						const geometry = this._skin(prev_src_geometry, src_geometry);
						geometries.push(geometry);
					}
				});
			}
		}

		this.setGeometries(geometries);
	}

	process_two_inputs(input_contents: CoreGroup[]) {
		const core_group0 = input_contents[0];
		const core_group1 = input_contents[1];
		const line_segments0 = this._get_line_segments(core_group0);
		const line_segments1 = this._get_line_segments(core_group1);
		const line_segments = ArrayUtils.sortBy([line_segments0, line_segments1], (array) => -array.length);
		const smallest_array = line_segments[0];
		const largest_array = line_segments[1];

		const geometries: BufferGeometry[] = [];
		smallest_array.forEach((line_segment, i) => {
			const other_line_segment = largest_array[i];

			if (line_segment != null && other_line_segment != null) {
				const geo = (line_segment as Mesh).geometry as BufferGeometry;
				const other_geo = (other_line_segment as Mesh).geometry as BufferGeometry;
				const geometry = this._skin(geo, other_geo);
				geometries.push(geometry);
			}
		});

		this.setGeometries(geometries);
	}

	_get_line_segments(core_group: CoreGroup) {
		return core_group.objects().filter((child) => (child as LineSegments).isLineSegments);
	}

	_skin(geometry1: BufferGeometry, geometry0: BufferGeometry) {
		// TODO: maybe instead of doing this,
		const geometry = new BufferGeometry();

		const operation = new CoreGeometryOperationSkin(geometry, geometry1, geometry0);
		operation.process();

		return geometry;
	}
}
