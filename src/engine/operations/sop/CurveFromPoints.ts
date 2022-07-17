import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Object3D, Vector3, Vector2} from 'three';
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
	// attributesToInterpolate: string;
}
const tmpV2 = new Vector2();
const current = new Vector3();
const next = new Vector3();

export class CurveFromPointsSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: CurveFromPointsSopParams = {
		pointsCount: 100,
		closed: false,
		curveType: 0,
		tension: 0.5,
		tTangent: false,
		tangentName: 'tangent',
		// attributesToInterpolate: '',
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'curveFromPoint'> {
		return 'curveFromPoint';
	}
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
		const geoPoints = coreGeo.points();
		const pointPositions = geoPoints.map((p) => p.getPosition(new Vector3()));
		if (pointPositions.length < 2) {
			return;
		}
		const curveTypeName = SPLINE_CURVE_TYPES[curveType];
		const curve = new CatmullRomCurve3(pointPositions, closed, curveTypeName, tension);

		// const positions: number[] = new Array(pointsCount * 3);

		// create indices
		const indices: number[] = new Array(pointsCount);
		for (let i = 0; i < pointsCount; i++) {
			// const t = i / (pointsCount - 1);
			// curve.getPoint(t, this._current);
			// this._current.toArray(positions, i * 3);

			if (i > 0) {
				indices[(i - 1) * 2] = i - 1;
				indices[(i - 1) * 2 + 1] = i;
			}
		}

		// create geo
		const geometry = new BufferGeometry();
		// geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);

		// attributes (position + attributesToInterpolate)
		const attribNamesToInterpolate = ['position']; //.concat(
		// coreGeo.attribNamesMatchingMask(params.attributesToInterpolate)
		// );
		for (const attribName of attribNamesToInterpolate) {
			const attribSize = coreGeo.attribSize(attribName);
			let attribPositions: Vector3[] = [];
			switch (attribSize) {
				case 1: {
					attribPositions = geoPoints.map((p) => new Vector3(p.attribValue(attribName) as number, 0, 0));
					break;
				}
				case 2: {
					attribPositions = geoPoints.map((p) => {
						p.attribValue(attribName, tmpV2);
						return new Vector3(tmpV2.x, tmpV2.y, 0);
					});
					break;
				}
				case 3: {
					attribPositions = geoPoints.map((p) => {
						p.attribValue(attribName, current);
						return current.clone();
					});
					break;
				}
			}
			const curveTypeName = SPLINE_CURVE_TYPES[curveType];
			const curve = new CatmullRomCurve3(attribPositions, closed, curveTypeName, tension);

			const attribValues: number[] = new Array(pointsCount * attribSize);

			for (let i = 0; i < pointsCount; i++) {
				const t = i / (pointsCount - 1);
				curve.getPoint(t, current);

				switch (attribSize) {
					case 1: {
						attribValues[i] = current.x;
						break;
					}
					case 2: {
						attribValues[2 * i] = current.x;
						attribValues[2 * i + 1] = current.y;
						break;
					}
					case 3: {
						current.toArray(attribValues, i * 3);
						break;
					}
				}
			}
			geometry.setAttribute(attribName, new Float32BufferAttribute(attribValues, attribSize));
		}

		// compute tangent
		if (tTangent) {
			const positions = geometry.getAttribute('position').array;
			const tangentName = params.tangentName;
			const tangents: number[] = new Array(pointsCount * 3);
			for (let i = 0; i < pointsCount - 1; i++) {
				current.fromArray(positions, i * 3);
				next.fromArray(positions, (i + 1) * 3);
				next.sub(current).normalize();
				next.toArray(tangents, i * 3);
			}
			// and last
			current.fromArray(positions, (pointsCount - 1) * 3);
			next.fromArray(positions, (pointsCount - 2) * 3);
			current.sub(next).normalize();
			next.toArray(tangents, (pointsCount - 1) * 3);
			geometry.setAttribute(tangentName, new Float32BufferAttribute(tangents, 3));
		}

		// add curve as userData to the object, to make it possible to use the curve from actor nodes
		const object = BaseSopOperation.createObject(geometry, ObjectType.LINE_SEGMENTS);
		object.userData['path'] = curve;

		return object;
	}
}
