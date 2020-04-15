import {LineSegments} from 'three/src/objects/LineSegments';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';

import {CatmullRomCurve3} from 'three/src/extras/curves/CatmullRomCurve3';
// import {CubicBezierCurve3} from 'three/src/extras/curves/CubicBezierCurve3';
// import {LineCurve3} from 'three/src/extras/curves/LineCurve3';
// import {QuadraticBezierCurve3} from 'three/src/extras/curves/QuadraticBezierCurve3';
import {BufferGeometryUtils} from '../../../../modules/three/examples/jsm/utils/BufferGeometryUtils';

import lodash_flatten from 'lodash/flatten';
import lodash_map from 'lodash/map';
import {TypedSopNode} from './_Base';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreGeometryUtilCurve} from '../../../core/geometry/util/Curve';
import {CoreGeometry} from '../../../core/geometry/Geometry';

export enum METHOD {
	POINTS_COUNT = 'points_count',
	SEGMENT_LENGTH = 'segment_length',
}
export const METHODS = [METHOD.POINTS_COUNT, METHOD.SEGMENT_LENGTH];

// matches threejs curve type in CatmullRomCurve3.js
export enum CURVE_TYPE {
	CENTRIPETAL = 'centripetal',
	CHORDAL = 'chordal',
	CATMULLROM = 'catmullrom',
}
export const CURVE_TYPES = [CURVE_TYPE.CENTRIPETAL, CURVE_TYPE.CHORDAL, CURVE_TYPE.CATMULLROM];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {CorePoint} from '../../../core/geometry/Point';
import {TypeAssert} from '../../poly/Assert';
class ResampleSopParamsConfig extends NodeParamsConfig {
	method = ParamConfig.INTEGER(METHODS.indexOf(METHOD.POINTS_COUNT), {
		menu: {
			entries: METHODS.map((name, i) => {
				return {
					name: name,
					value: i,
				};
			}),
		},
	});
	curve_type = ParamConfig.INTEGER(CURVE_TYPES.indexOf(CURVE_TYPE.CATMULLROM), {
		range: [0, 2],
		range_locked: [true, true],
		menu: {
			entries: CURVE_TYPES.map((name, i) => {
				return {
					name: name,
					value: i,
				};
			}),
		},
	});
	tension = ParamConfig.FLOAT(0.01, {
		range: [0, 1],
		range_locked: [true, true],
	});
	points_count = ParamConfig.INTEGER(100, {
		visible_if: {method: METHODS.indexOf(METHOD.POINTS_COUNT)},
	});
	segment_length = ParamConfig.FLOAT(1, {
		visible_if: {method: METHODS.indexOf(METHOD.SEGMENT_LENGTH)},
	});
}
const ParamsConfig = new ResampleSopParamsConfig();

export class ResampleSopNode extends TypedSopNode<ResampleSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'resample';
	}

	// private _objects: Object3D

	initialize_node() {
		this.io.inputs.set_count(1);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];

		// this._objects = [];
		const resampled_objects = [];
		if (this.pv.points_count >= 2) {
			const core_objects = core_group.core_objects();
			for (let i = 0; i < core_objects.length; i++) {
				const core_object = core_objects[i];
				const object = core_object.object();
				if (object instanceof LineSegments) {
					const resampled_object = this._resample(object);
					resampled_objects.push(resampled_object);
				}
			}
		}

		// if (this.pv.merge) {
		// 	const geometries = lodash_map(this._objects, object => object.geometry);
		// 	const merged_geometry = CoreGeometry.merge_geometries(geometries);
		// 	lodash_each(geometries, geometry => geometry.dispose());
		// 	const object = this.create_object(merged_geometry, CoreConstant.OBJECT_TYPE.LINE_SEGMENTS);
		// 	this.set_object( object );
		// } else {
		this.set_objects(resampled_objects);
		// }
	}

	_resample(line_segment: LineSegments) {
		const geometry = line_segment.geometry as BufferGeometry;
		const core_geometry = new CoreGeometry(geometry);
		const points = core_geometry.points();
		const indices = geometry.getIndex()?.array as number[];

		const accumulated_curve_point_indices = CoreGeometryUtilCurve.accumulated_curve_point_indices(indices);
		// accumulated_curve_point_indices = [accumulated_curve_point_indices[0]]
		const geometries: BufferGeometry[] = [];
		for (let i = 0; i < accumulated_curve_point_indices.length; i++) {
			const curve_point_indices = accumulated_curve_point_indices[i];
			const current_points = curve_point_indices.map((index) => points[index]);
			const geometry = this._create_curve_from_points(current_points);
			if (geometry) {
				geometries.push(geometry);
			}
		}
		const merged_geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
		const object = this.create_object(merged_geometry, ObjectType.LINE_SEGMENTS);
		return object;
	}

	_create_curve_from_points(points: CorePoint[]) {
		if (points.length <= 1) {
			return;
		}

		const old_curve_positions = lodash_map(points, (point) => point.attrib_value('position'));
		const closed = false;
		const curve_type = CURVE_TYPES[this.pv.curve_type];
		const tension = this.pv.tension;
		const curve = new CatmullRomCurve3(old_curve_positions, closed, curve_type, tension);
		// const curve = new LineCurve3(old_curve_positions);
		// const curve = new CubicBezierCurve3(old_curve_positions);
		// const curve = new QuadraticBezierCurve3(old_curve_positions);

		// TODO: could I detect when a curve has points that are very close
		// and prevent a curve to go too far
		const new_curve_points = this._get_points_from_curve(curve);

		let positions = [];
		const indices = [];

		for (let i = 0; i < new_curve_points.length; i++) {
			const point_position = new_curve_points[i];

			const position = point_position.toArray();
			positions.push(position);

			if (i > 0) {
				indices.push(i - 1);
				indices.push(i);
			}
		}

		positions = lodash_flatten(positions);
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);

		return geometry;
		// const object = this.create_object(geometry, CoreConstant.OBJECT_TYPE.LINE_SEGMENTS);
		// this._objects.push(object);
	}

	_get_points_from_curve(curve: CatmullRomCurve3) {
		const method = METHODS[this.pv.method];
		switch (method) {
			case METHOD.POINTS_COUNT:
				return curve.getSpacedPoints(Math.max(2, this.pv.points_count));
			case METHOD.SEGMENT_LENGTH:
				var length = curve.getLength();

				var points_count = this.pv.segment_length !== 0 ? 1 + length / this.pv.segment_length : 2;

				points_count = Math.max(2, points_count);

				return curve.getSpacedPoints(points_count);
		}
		TypeAssert.unreachable(method);
	}
}
