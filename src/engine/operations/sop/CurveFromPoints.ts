import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Object3D, Vector3} from 'three';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {ObjectType} from '../../../core/geometry/Constant';
import {CoreObject} from '../../../core/geometry/Object';
import {SPLINE_CURVE_TYPES} from '../../../core/geometry/Curve';

interface CurveFromPointsSopParams extends DefaultOperationParams {
	pointsCount: number;
	closed: boolean;
	curveType: number;
	tension: number;
	tTangent: boolean;
	tangentName: string;
}

export class CurveFromPointsSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CurveFromPointsSopParams = {
		pointsCount: 100,
		closed: false,
		curveType: 0,
		tension: 0.5,
		tTangent: false,
		tangentName: 'tangent',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'curveFromPoint'> {
		return 'curveFromPoint';
	}
	private _current = new Vector3();
	private _next = new Vector3();
	override cook(inputCoreGroups: CoreGroup[], params: CurveFromPointsSopParams) {
		const inputCoreGroup = inputCoreGroups[0];

		const coreObjects = inputCoreGroup.coreObjects();
		const newObjects: Object3D[] = [];
		for (let coreObject of coreObjects) {
			const object = this._createCurveFromCoreObject(coreObject, params);
			if (object) {
				newObjects.push(object);
			}
		}

		return this.createCoreGroupFromObjects(newObjects);
	}

	private _createCurveFromCoreObject(coreObject: CoreObject, params: CurveFromPointsSopParams) {
		const {pointsCount, closed, curveType, tension, tTangent} = params;
		const coreGeo = coreObject.coreGeometry();
		if (!coreGeo) {
			return;
		}
		const points = coreGeo.points().map((p) => p.getPosition(new Vector3()));
		if (points.length < 2) {
			return;
		}
		const curveTypeName = SPLINE_CURVE_TYPES[curveType];
		const curve = new CatmullRomCurve3(points, closed, curveTypeName, tension);

		const positions: number[] = new Array(pointsCount * 3);

		const indices: number[] = new Array(pointsCount);
		for (let i = 0; i < pointsCount; i++) {
			const t = i / (pointsCount - 1);
			curve.getPoint(t, this._current);
			this._current.toArray(positions, i * 3);

			if (i > 0) {
				indices[(i - 1) * 2] = i - 1;
				indices[(i - 1) * 2 + 1] = i;
			}
			if (tTangent) {
			}
		}

		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		if (tTangent) {
			const tangentName = params.tangentName;
			const tangents: number[] = new Array(pointsCount * 3);
			for (let i = 0; i < pointsCount - 1; i++) {
				this._current.fromArray(positions, i * 3);
				this._next.fromArray(positions, (i + 1) * 3);
				this._next.sub(this._current).normalize();
				this._next.toArray(tangents, i * 3);
			}
			// and last
			this._current.fromArray(positions, (pointsCount - 1) * 3);
			this._next.fromArray(positions, (pointsCount - 2) * 3);
			this._current.sub(this._next).normalize();
			this._next.toArray(tangents, (pointsCount - 1) * 3);
			geometry.setAttribute(tangentName, new Float32BufferAttribute(tangents, 3));
		}

		const object = BaseSopOperation.createObject(geometry, ObjectType.LINE_SEGMENTS);
		object.userData['path'] = curve;
		return object;
	}
}
