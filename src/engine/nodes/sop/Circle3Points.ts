/**
 * Creates a circle from 3 points.
 *
 *
 */
import {TypedSopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CoreGroup} from '../../../core/geometry/Group';
import {CorePoint} from '../../../core/geometry/Point';
import {Vector3} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';
import {Object3D} from 'three';

import {
	PointsCountMode,
	POINTS_COUNT_MODE,
	JoinMode,
	JOIN_MODES,
	Circle3Points,
} from '../../../core/geometry/operation/Circle3Points';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {SopType} from '../../poly/registers/nodes/types/Sop';
class Circle3PointsSopParamsConfig extends NodeParamsConfig {
	/** @param toggle on to create the arc */
	arc = ParamConfig.BOOLEAN(1);
	/** @param sets the mode how the points count is computed */
	pointsCountMode = ParamConfig.INTEGER(POINTS_COUNT_MODE.indexOf(PointsCountMode.SEGMENTS_COUNT), {
		visibleIf: {arc: 1},
		menu: {
			entries: POINTS_COUNT_MODE.map((name, value) => {
				return {value, name};
			}),
		},
	});
	/** @param length of each segment */
	segmentsLength = ParamConfig.FLOAT(0.1, {
		visibleIf: {arc: 1, pointsCountMode: POINTS_COUNT_MODE.indexOf(PointsCountMode.SEGMENTS_LENGTH)},
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param count of the number of segments */
	segmentsCount = ParamConfig.INTEGER(100, {
		visibleIf: {arc: 1, pointsCountMode: POINTS_COUNT_MODE.indexOf(PointsCountMode.SEGMENTS_COUNT)},
		range: [1, 100],
		rangeLocked: [true, false],
	});
	/** @param toggle on to create a full circle */
	full = ParamConfig.BOOLEAN(1, {
		visibleIf: {arc: 1},
	});
	/** @param TBD */
	joinMode = ParamConfig.INTEGER(JOIN_MODES.indexOf(JoinMode.ABC), {
		visibleIf: {arc: 1, full: 0},
		menu: {
			entries: JOIN_MODES.map((name, value) => {
				return {value, name};
			}),
		},
	});
	/** @param add an id attribute for the generated points */
	addIdAttribute = ParamConfig.BOOLEAN(1);
	/** @param add an idn attribute (same as id attribute, but normalized between 0 and 1) */
	addIdnAttribute = ParamConfig.BOOLEAN(1);
	/** @param toggle on to create a point in the center */
	center = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new Circle3PointsSopParamsConfig();

export class Circle3PointsSopNode extends TypedSopNode<Circle3PointsSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.CIRCLE_3_POINTS;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState([InputCloneMode.NEVER]);
	}

	setPointsCountMode(mode: PointsCountMode) {
		this.p.pointsCountMode.set(POINTS_COUNT_MODE.indexOf(mode));
	}
	pointsCountMode() {
		return POINTS_COUNT_MODE[this.pv.pointsCountMode];
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const points = coreGroup.points();
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
			arc: isBooleanTrue(this.pv.arc),
			center: isBooleanTrue(this.pv.center),
			pointsCountMode: POINTS_COUNT_MODE[this.pv.pointsCountMode],
			segmentsLength: this.pv.segmentsLength,
			segmentsCount: this.pv.segmentsCount,
			full: isBooleanTrue(this.pv.full),
			joinMode: JOIN_MODES[this.pv.joinMode],
			addIdAttribute: isBooleanTrue(this.pv.addIdAttribute),
			addIdnAttribute: isBooleanTrue(this.pv.addIdnAttribute),
		});
		points[0].getPosition(this.a);
		points[1].getPosition(this.b);
		points[2].getPosition(this.c);
		circle3points.create(this.a, this.b, this.c);

		const objects: Object3D[] = [];
		const created_geometries = circle3points.created_geometries();
		if (created_geometries.arc) {
			objects.push(this.createObject(created_geometries.arc, ObjectType.LINE_SEGMENTS));
		}
		if (created_geometries.center) {
			objects.push(this.createObject(created_geometries.center, ObjectType.POINTS));
		}

		let i = 0;
		for (let object of objects) {
			object.name = `${this.name()}-${i}`;
			i++;
		}

		this.setObjects(objects);
	}
}
