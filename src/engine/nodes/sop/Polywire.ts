/**
 * Creates a tube-like geometry around a line.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {CoreTransform, DEFAULT_ROTATION_ORDER} from '../../../core/Transform';
import {CoreGeometryUtilCircle} from '../../../core/geometry/util/Circle';
import {CoreGeometryUtilCurve} from '../../../core/geometry/util/Curve';
import {CoreGeometryOperationSkin} from '../../../core/geometry/operation/Skin';
import {Vector3} from 'three/src/math/Vector3';
import {LineSegments} from 'three/src/objects/LineSegments';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {InputCloneMode} from '../../poly/InputCloneMode';

const POSITION_ATTRIBUTE_NAME = 'position';
const DEFAULT_R = new Vector3(0, 0, 0);
const DEFAULT_S = new Vector3(1, 1, 1);

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {CorePoint} from '../../../core/geometry/Point';
import {ObjectType} from '../../../core/geometry/Constant';
class PolywireSopParamsConfig extends NodeParamsConfig {
	/** @param radius */
	radius = ParamConfig.FLOAT(1);
	/** @param segments count on the circle used */
	segments_radial = ParamConfig.INTEGER(8, {
		range: [3, 20],
		rangeLocked: [true, false],
	});
	/** @param toggle on for the geometry to close back on itself */
	closed = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new PolywireSopParamsConfig();

export class PolywireSopNode extends TypedSopNode<PolywireSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'polywire';
	}

	static displayed_input_names(): string[] {
		return ['lines to create tubes from'];
	}

	private _core_transform = new CoreTransform();

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state(InputCloneMode.NEVER);
	}

	private _geometries: BufferGeometry[] = [];

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		this._geometries = [];
		for (let object of core_group.objects()) {
			if (object instanceof LineSegments) {
				this._create_tube(object);
			}
		}

		const merged_geometry = CoreGeometry.merge_geometries(this._geometries);
		for (let geometry of this._geometries) {
			geometry.dispose();
		}
		if (merged_geometry) {
			const object = this.create_object(merged_geometry, ObjectType.MESH);

			this.set_object(object);
		} else {
			this.set_objects([]);
		}
	}

	_create_tube(line_segment: LineSegments) {
		const geometry = line_segment.geometry as BufferGeometry;
		const wrapper = new CoreGeometry(geometry);
		const points = wrapper.points();
		const indices = geometry.getIndex()?.array as number[];

		const accumulated_curve_point_indices = CoreGeometryUtilCurve.accumulated_curve_point_indices(indices);

		for (let curve_point_indices of accumulated_curve_point_indices) {
			const current_points = curve_point_indices.map((index) => points[index]);
			this._create_tube_from_points(current_points);
		}
	}

	_create_tube_from_points(points: CorePoint[]) {
		if (points.length <= 1) {
			return;
		}

		const positions = points.map((point) => point.attrib_value(POSITION_ATTRIBUTE_NAME)) as Vector3[];

		const circle_template = CoreGeometryUtilCircle.create(this.pv.radius, this.pv.segments_radial);
		const circles: BufferGeometry[] = [];
		const scale = 1;
		for (let position of positions) {
			const t = position;
			const matrix = this._core_transform.matrix(t, DEFAULT_R, DEFAULT_S, scale, DEFAULT_ROTATION_ORDER);

			const new_circle = circle_template.clone();
			new_circle.applyMatrix4(matrix);
			circles.push(new_circle);
		}

		for (let i = 0; i < circles.length; i++) {
			if (i > 0) {
				const circle = circles[i];
				const prev_circle = circles[i - 1];

				const geometry = this._skin(prev_circle, circle);
				this._geometries.push(geometry);
			}
		}
	}

	_skin(geometry1: BufferGeometry, geometry0: BufferGeometry) {
		const geometry = new BufferGeometry();

		const operation = new CoreGeometryOperationSkin(geometry, geometry1, geometry0);
		operation.process();

		return geometry;
	}
}
