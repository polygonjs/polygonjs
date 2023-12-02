/**
 * Resample input lines
 *
 */
import {LineSegments} from 'three';
import {Float32BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {CatmullRomCurve3} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';
import {TypedSopNode} from './_Base';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreGeometryUtilCurve} from '../../../core/geometry/util/Curve';

export enum METHOD {
	POINTS_COUNT = 'pointsCount',
	SEGMENT_LENGTH = 'segmentLength',
}
export const METHODS = [METHOD.POINTS_COUNT, METHOD.SEGMENT_LENGTH];

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {BaseCorePoint, CorePoint} from '../../../core/geometry/entities/point/CorePoint';
import {TypeAssert} from '../../poly/Assert';
import {Vector3} from 'three';
import {SplineCurveType, SPLINE_CURVE_TYPES} from '../../../core/geometry/Curve';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import {Attribute} from '../../../core/geometry/Attribute';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';

const _points: CorePoint<CoreObjectType>[] = [];
class ResampleSopParamsConfig extends NodeParamsConfig {
	/** @param resampling method */
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
	/** @param type of curve this will generate */
	curveType = ParamConfig.INTEGER(SPLINE_CURVE_TYPES.indexOf(SplineCurveType.CATMULLROM), {
		range: [0, 2],
		rangeLocked: [true, true],
		menu: {
			entries: SPLINE_CURVE_TYPES.map((name, i) => {
				return {
					name: name,
					value: i,
				};
			}),
		},
	});
	/** @param curve tension */
	tension = ParamConfig.FLOAT(0.01, {
		range: [0, 1],
		rangeLocked: [true, true],
		visibleIf: {curveType: SPLINE_CURVE_TYPES.indexOf(SplineCurveType.CATMULLROM)},
	});
	/** @param points count */
	pointsCount = ParamConfig.INTEGER(100, {
		visibleIf: {method: METHODS.indexOf(METHOD.POINTS_COUNT)},
		range: [1, 1000],
		rangeLocked: [true, false],
	});
	/** @param segments length */
	segmentLength = ParamConfig.FLOAT(1, {
		visibleIf: {method: METHODS.indexOf(METHOD.SEGMENT_LENGTH)},
	});
}
const ParamsConfig = new ResampleSopParamsConfig();

export class ResampleSopNode extends TypedSopNode<ResampleSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'resample';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];

		const resampledObjects: LineSegments[] = [];
		if (this.pv.pointsCount >= 2) {
			const coreObjects = coreGroup.threejsCoreObjects();
			for (const coreObject of coreObjects) {
				const object = coreObject.object();
				if (object instanceof LineSegments) {
					const resampledObject = this._resample(object);
					if (resampledObject) {
						resampledObjects.push(resampledObject);
					}
				}
			}
		}

		this.setObjects(resampledObjects);
	}
	setCurveType(curveType: SplineCurveType) {
		this.p.curveType.set(SPLINE_CURVE_TYPES.indexOf(curveType));
	}

	_resample(lineSegment: LineSegments) {
		const geometry = lineSegment.geometry as BufferGeometry;
		pointsFromObject(lineSegment, _points);
		const indices = geometry.getIndex()?.array;
		if (!indices) {
			return;
		}

		const accumulated_curve_point_indices = CoreGeometryUtilCurve.accumulatedCurvePointIndices(indices);
		// accumulated_curve_point_indices = [accumulated_curve_point_indices[0]]
		const geometries: BufferGeometry[] = [];
		for (let i = 0; i < accumulated_curve_point_indices.length; i++) {
			const curve_point_indices = accumulated_curve_point_indices[i];
			const current_points = curve_point_indices.map((index) => _points[index]);
			const geometry = this._create_curve_from_points(current_points);
			if (geometry) {
				geometries.push(geometry);
			}
		}
		const mergedGeometry = mergeGeometries(geometries);
		const object = this.createObject(mergedGeometry, ObjectType.LINE_SEGMENTS);
		return object;
	}

	_create_curve_from_points(points: BaseCorePoint[]) {
		if (points.length <= 1) {
			return;
		}

		const old_curve_positions = points.map((point) => point.attribValue(Attribute.POSITION)) as Vector3[];
		const closed = false;
		const curveType = SPLINE_CURVE_TYPES[this.pv.curveType];
		const tension = this.pv.tension;
		const curve = new CatmullRomCurve3(old_curve_positions, closed, curveType, tension);
		// const curve = new LineCurve3(old_curve_positions);
		// const curve = new CubicBezierCurve3(old_curve_positions);
		// const curve = new QuadraticBezierCurve3(old_curve_positions);

		// TODO: could I detect when a curve has points that are very close
		// and prevent a curve to go too far
		const new_curve_points = this._get_points_from_curve(curve);

		let positions: number[][] = [];
		const indices: number[] = [];

		for (let i = 0; i < new_curve_points.length; i++) {
			const point_position = new_curve_points[i];

			const position = point_position.toArray();
			positions.push(position);

			if (i > 0) {
				indices.push(i - 1);
				indices.push(i);
			}
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions.flat(), 3));
		geometry.setIndex(indices);

		return geometry;
	}

	_get_points_from_curve(curve: CatmullRomCurve3) {
		const method = METHODS[this.pv.method];
		switch (method) {
			case METHOD.POINTS_COUNT:
				return curve.getSpacedPoints(Math.max(2, this.pv.pointsCount));
			case METHOD.SEGMENT_LENGTH:
				var length = curve.getLength();

				var pointsCount = this.pv.segmentLength !== 0 ? 1 + length / this.pv.segmentLength : 2;

				pointsCount = Math.max(2, pointsCount);

				return curve.getSpacedPoints(pointsCount);
		}
		TypeAssert.unreachable(method);
	}
}
