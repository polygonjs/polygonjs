import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Object3D, Vector3} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreObject} from '../../../core/geometry/Object';
import {SPLINE_CURVE_TYPES} from '../../../core/geometry/Curve';

const EPSILON = 0.001;

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

		const coreObjects = inputCoreGroup.threejsCoreObjects();
		const newObjects: Object3D[] = [];
		for (let coreObject of coreObjects) {
			const object = this._createSplineFromCoreObject(coreObject, params);
			if (object) {
				newObjects.push(object);
			}
		}

		return this.createCoreGroupFromObjects(newObjects);
	}

	private _createSplineFromCoreObject(coreObject: CoreObject, params: CurveGetPointSopParams) {
		const {t, closed, curveType, tension, tTangent} = params;
		const coreGeo = coreObject.coreGeometry();
		if (!coreGeo) {
			return;
		}
		const points = coreGeo.points().map((p) => p.position(new Vector3()));
		if (points.length < 2) {
			return;
		}
		const curveTypeName = SPLINE_CURVE_TYPES[curveType];
		const curve = new CatmullRomCurve3(points, closed, curveTypeName, tension);

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

		const object = BaseSopOperation.createObject(geometry, ObjectType.POINTS);
		return object;
	}
}
