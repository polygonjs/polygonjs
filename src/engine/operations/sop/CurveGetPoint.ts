import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Object3D, Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ObjectType} from '../../../core/geometry/Constant';
import {SPLINE_CURVE_TYPES} from '../../../core/geometry/Curve';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {pointsFromObject} from '../../../core/geometry/entities/point/CorePointUtils';
import { CorePoint } from '../../../core/geometry/entities/point/CorePoint';

const EPSILON = 0.001;
const _points:CorePoint<CoreObjectType>[]=[]

interface CurveGetPointSopParams extends DefaultOperationParams {
	t: number;
	closed: boolean;
	curveType: number;
	tension: number;
	tTangent: boolean;
	tangentName: string;
}

export class CurveGetPointSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CurveGetPointSopParams = {
		t: 0,
		closed: false,
		curveType: 0,
		tension: 0.5,
		tTangent: false,
		tangentName: 'tangent',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'curveGetPoint'> {
		return 'curveGetPoint';
	}
	private _current = new Vector3();
	private _next = new Vector3();
	override cook(inputCoreGroups: CoreGroup[], params: CurveGetPointSopParams) {
		const inputCoreGroup = inputCoreGroups[0];

		const objects = inputCoreGroup.allObjects();
		const newObjects: Object3D[] = [];
		for (let object of objects) {
			const newObject = this._createSplineFromCoreObject(object, params);
			if (newObject) {
				newObjects.push(newObject);
			}
		}

		return this.createCoreGroupFromObjects(newObjects);
	}

	private _createSplineFromCoreObject<T extends CoreObjectType>(
		object: ObjectContent<T>,
		params: CurveGetPointSopParams
	) {
		const {t, closed, curveType, tension, tTangent} = params;
		pointsFromObject(object, _points)
		if (_points.length < 2) {
			return;
		}
		const pointPositions = _points.map((p) => p.position(new Vector3()));
		const curveTypeName = SPLINE_CURVE_TYPES[curveType];
		const curve = new CatmullRomCurve3(pointPositions, closed, curveTypeName, tension);

		const positions: number[] = new Array(3);

		curve.getPoint(t, this._current);
		this._current.toArray(positions, 0);

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		if (tTangent) {
			const tangents: number[] = new Array(3);
			const tangentName = params.tangentName;
			const inFirstHalf = t < 0.5;
			const t2 = inFirstHalf ? t + EPSILON : t - EPSILON;
			curve.getPoint(t2, this._next);

			if (inFirstHalf) {
				this._next.sub(this._current).normalize();
			} else {
				this._current.sub(this._next).normalize();
				this._next.copy(this._current);
			}
			this._next.toArray(tangents, 0);
			geometry.setAttribute(tangentName, new Float32BufferAttribute(tangents, 3));
		}

		const newObject = BaseSopOperation.createObject(geometry, ObjectType.POINTS);
		return newObject;
	}
}
