import {TypedSopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {CorePoint} from '../../../core/geometry/Point';
import {Vector3} from 'three/src/math/Vector3';
import {ObjectType} from '../../../core/geometry/Constant';
import {Object3D} from 'three/src/core/Object3D';

import {
	PointsCountMode,
	POINTS_COUNT_MODE,
	JoinMode,
	JOIN_MODES,
	Circle3Points,
} from '../../../core/geometry/operation/Circle3Points';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class Circle3PointsSopParamsConfig extends NodeParamsConfig {
	arc = ParamConfig.BOOLEAN(1);
	points_count_mode = ParamConfig.INTEGER(POINTS_COUNT_MODE.indexOf(PointsCountMode.SEGMENTS_COUNT), {
		visible_if: {arc: 1},
		menu: {
			entries: POINTS_COUNT_MODE.map((name, value) => {
				return {value, name};
			}),
		},
	});
	segments_length = ParamConfig.FLOAT(0.1, {
		visible_if: {arc: 1, points_count_mode: POINTS_COUNT_MODE.indexOf(PointsCountMode.SEGMENTS_LENGTH)},
		range: [0, 1],
		range_locked: [true, false],
	});
	segments_count = ParamConfig.INTEGER(100, {
		visible_if: {arc: 1, points_count_mode: POINTS_COUNT_MODE.indexOf(PointsCountMode.SEGMENTS_COUNT)},
		range: [1, 100],
		range_locked: [true, false],
	});
	full = ParamConfig.BOOLEAN(1, {
		visible_if: {arc: 1},
	});
	join_mode = ParamConfig.INTEGER(JOIN_MODES.indexOf(JoinMode.ABC), {
		visible_if: {arc: 1, full: 0},
		menu: {
			entries: JOIN_MODES.map((name, value) => {
				return {value, name};
			}),
		},
	});
	add_id_attribute = ParamConfig.BOOLEAN(1);
	add_idn_attribute = ParamConfig.BOOLEAN(1);
	center = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new Circle3PointsSopParamsConfig();

export class Circle3PointsSopNode extends TypedSopNode<Circle3PointsSopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'circle3points';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.NEVER]);
	}

	cook(input_contents: CoreGroup[]) {
		const core_group = input_contents[0];
		const points = core_group.points();
		if (points.length < 3) {
			this.states.error.set(`only ${points.length} points found, when 3 are required`);
		} else {
			this._create_circle(points);
		}
	}

	private a: Vector3 = new Vector3();
	private b: Vector3 = new Vector3();
	private c: Vector3 = new Vector3();

	private _create_circle(points: CorePoint[]) {
		const circle3points = new Circle3Points({
			arc: this.pv.arc,
			center: this.pv.center,
			points_count_mode: POINTS_COUNT_MODE[this.pv.points_count_mode],
			segments_length: this.pv.segments_length,
			segments_count: this.pv.segments_count,
			full: this.pv.full,
			join_mode: JOIN_MODES[this.pv.join_mode],
			add_id_attribute: this.pv.add_id_attribute,
			add_idn_attribute: this.pv.add_idn_attribute,
		});
		points[0].position(this.a);
		points[1].position(this.b);
		points[2].position(this.c);
		circle3points.create(this.a, this.b, this.c);

		const objects: Object3D[] = [];
		const created_geometries = circle3points.created_geometries();
		if (created_geometries.arc) {
			objects.push(this.create_object(created_geometries.arc, ObjectType.LINE_SEGMENTS));
		}
		if (created_geometries.center) {
			objects.push(this.create_object(created_geometries.center, ObjectType.POINTS));
		}

		this.set_objects(objects);
	}
}
