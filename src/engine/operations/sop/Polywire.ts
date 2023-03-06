import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Vector3} from 'three';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreGeometry} from '../../../core/geometry/Geometry';
import {CoreTransform, DEFAULT_ROTATION_ORDER} from '../../../core/Transform';
import {CircleCreateOptions, CoreGeometryUtilCircle} from '../../../core/geometry/util/Circle';
import {CoreGeometryUtilCurve} from '../../../core/geometry/util/Curve';
import {CoreGeometryOperationSkin} from '../../../core/geometry/operation/Skin';
import {LineSegments} from 'three';
import {BufferGeometry} from 'three';
import {CorePoint} from '../../../core/geometry/Point';
import {isBooleanTrue} from '../../../core/Type';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreGeometryBuilderMerge} from '../../../core/geometry/builders/Merge';
import {addAttributesFromPoint} from '../../../core/geometry/util/addAttributesFromPoint';

interface PolywireSopParams extends DefaultOperationParams {
	radius: number;
	segmentsRadial: number;
	closed: boolean;
	attributesToCopy: string;
}
const DEFAULT_R = new Vector3(0, 0, 0);
const DEFAULT_S = new Vector3(1, 1, 1);
const DEFAULT_DIR = new Vector3(0, 0, 1);

const currentPos = new Vector3();
const prevPos = new Vector3();
const nextPos = new Vector3();
const delta = new Vector3();
const deltaNext = new Vector3();
const deltaPrev = new Vector3();

export class PolywireSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PolywireSopParams = {
		radius: 1,
		segmentsRadial: 8,
		closed: true,
		attributesToCopy: '*',
	};
	static override type(): Readonly<'polywire'> {
		return 'polywire';
	}

	private _coreTransform = new CoreTransform();
	private _geometries: BufferGeometry[] = [];
	override cook(inputCoreGroups: CoreGroup[], params: PolywireSopParams) {
		const coreGroup = inputCoreGroups[0];

		this._geometries = [];
		for (let object of coreGroup.threejsObjects()) {
			if (object instanceof LineSegments) {
				this._createTube(object, params);
			}
		}

		const mergedGeometry = CoreGeometryBuilderMerge.merge(this._geometries);
		for (let geometry of this._geometries) {
			geometry.dispose();
		}
		if (mergedGeometry) {
			const object = this.createObject(mergedGeometry, ObjectType.MESH);
			return this.createCoreGroupFromObjects([object]);
		} else {
			return this.createCoreGroupFromObjects([]);
		}
	}

	private _createTube(lineSegment: LineSegments, params: PolywireSopParams) {
		const geometry = lineSegment.geometry as BufferGeometry;
		const attributeNames = CoreGeometry.attribNamesMatchingMask(geometry, params.attributesToCopy);
		const wrapper = new CoreGeometry(geometry);
		const points = wrapper.points();
		const indices = geometry.getIndex()?.array as number[];

		const accumulatedCurvePointIndices = CoreGeometryUtilCurve.accumulatedCurvePointIndices(indices);

		for (let curvePointIndices of accumulatedCurvePointIndices) {
			const currentPoints = curvePointIndices.map((index) => points[index]);
			this._createTubeFromPoints(currentPoints, attributeNames, params);
		}
	}

	private _createTubeFromPoints(points: CorePoint[], attributeNames: string[], params: PolywireSopParams) {
		if (points.length <= 1) {
			return;
		}

		const options: CircleCreateOptions = {
			radius: params.radius,
			segments: params.segmentsRadial,
			arcAngle: 360,
			connectLastPoint: true,
		};
		const circleTemplate = CoreGeometryUtilCircle.create(options);
		const circles: BufferGeometry[] = [];
		const scale = 1;
		let i = 0;
		for (let point of points) {
			point.getPosition(currentPos);
			let prevPoint = points[i - 1];
			let nextPoint = points[i + 1];
			if (prevPoint && nextPoint) {
				// if we have both prev and next points, the dir is a blend between the dir to the prev and to the next
				nextPoint.getPosition(nextPos);
				deltaNext.copy(nextPos).sub(currentPos);
				prevPoint.getPosition(prevPos);
				deltaPrev.copy(prevPos).sub(currentPos).multiplyScalar(-1);
				delta.lerpVectors(deltaNext, deltaPrev, 0.5);
			} else {
				if (nextPoint) {
					nextPoint.getPosition(nextPos);
					delta.copy(nextPos).sub(currentPos);
				} else {
					nextPoint = points[i - 1];
					nextPoint.getPosition(nextPos);
					delta.copy(nextPos).sub(currentPos).multiplyScalar(-1);
				}
			}

			const newCircle = circleTemplate.clone();
			this._coreTransform.rotateGeometry(newCircle, DEFAULT_DIR, delta);
			const matrix = this._coreTransform.matrix(currentPos, DEFAULT_R, DEFAULT_S, scale, DEFAULT_ROTATION_ORDER);
			newCircle.applyMatrix4(matrix);

			// remove position before transfering the attribute
			const positionIndex = attributeNames.indexOf('position');
			if (positionIndex >= 0) {
				attributeNames.splice(positionIndex, 1);
			}
			addAttributesFromPoint(newCircle, point, attributeNames);

			circles.push(newCircle);
			i++;
		}

		for (let i = 0; i < circles.length; i++) {
			if (i > 0) {
				const circle = circles[i];
				const prevCircle = circles[i - 1];

				const geometry = this._skin(prevCircle, circle);
				this._geometries.push(geometry);
			}
		}
		if (isBooleanTrue(params.closed)) {
			const circle = circles[0];
			const prevCircle = circles[circles.length - 1];

			const geometry = this._skin(prevCircle, circle);
			this._geometries.push(geometry);
		}
	}

	_skin(geometry1: BufferGeometry, geometry0: BufferGeometry) {
		const geometry = new BufferGeometry();

		const operation = new CoreGeometryOperationSkin(geometry, geometry1, geometry0);
		operation.process();

		return geometry;
	}
}
