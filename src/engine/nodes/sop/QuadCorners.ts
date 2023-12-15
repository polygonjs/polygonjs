/**
 * Builds geometries on quad points
 *
 *
 */
import {Vector3, Plane, Object3D, BoxGeometry, BufferGeometry} from 'three';
import {QuadSopNode} from './_BaseQuad';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {CoreGroup} from '../../../core/geometry/Group';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {QuadObject} from '../../../core/geometry/modules/quad/QuadObject';
import {QuadPrimitive} from '../../../core/geometry/modules/quad/QuadPrimitive';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {quadGraphFromQuadObject} from '../../../core/geometry/modules/quad/graph/QuadGraphUtils';
import {QuadPoint} from '../../../core/geometry/modules/quad/QuadPoint';
import {quadPrimitiveOppositePoints, QuadOppositePoints} from '../../../core/geometry/modules/quad/QuadPrimitiveUtils';
import {ConvexGeometry} from 'three/examples/jsm/geometries/ConvexGeometry';
import {ObjectType} from '../../../core/geometry/Constant';
import {ThreejsCoreObject} from '../../../core/geometry/modules/three/ThreejsCoreObject';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils';

const _currentPointPosition = new Vector3();
const _neighbourPosition = new Vector3();
const _neighbourPositionOnPlane = new Vector3();
const _delta = new Vector3();
const _tmp = new Vector3();
const _normal = new Vector3();
const _plane = new Plane();
const _positions: Vector3[] = [];
const quadOppositePoints: QuadOppositePoints = {
	p0: -1,
	p1: -1,
};
const _pointIdsSet: Set<number> = new Set();
const BOX_DIVISIONS = 1;
const _newObjectsForPoint: Object3D[] = [];

class QuadCornersSopParamsConfig extends NodeParamsConfig {
	center = ParamConfig.BOOLEAN(1);
	star = ParamConfig.BOOLEAN(1);
	height = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [false, false],
	});
	centerSize = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [false, false],
		visibleIf: {center: 1},
	});
	starSize = ParamConfig.VECTOR2([0.05, 0.3], {
		visibleIf: {star: 1},
	});
	cornersAttribName = ParamConfig.STRING('cornersCount');
	quadsAttribName = ParamConfig.STRING('quadsCount');
}
const ParamsConfig = new QuadCornersSopParamsConfig();

export class QuadCornersSopNode extends QuadSopNode<QuadCornersSopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return SopType.QUAD_CORNERS;
	}

	protected override initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);
	}

	override cook(inputCoreGroups: CoreGroup[]) {
		const coreGroup = inputCoreGroups[0];
		const objects = coreGroup.quadObjects();
		if (!objects) {
			this.states.error.set(`no quad objects found`);
			return;
		}

		const newObjects: Object3D[] = [];
		for (const object of objects) {
			this._processObject(object, newObjects);
		}

		this.setObjects(newObjects);
	}

	private _processObject(quadObject: QuadObject, newObjects: Object3D[]) {
		const {center, star, centerSize, starSize, height, cornersAttribName, quadsAttribName} = this.pv;
		const graph = quadGraphFromQuadObject(quadObject);
		const pointsCount = QuadPoint.entitiesCount(quadObject);

		for (let i = 0; i < pointsCount; i++) {
			_newObjectsForPoint.length = 0;
			QuadPoint.position(quadObject, i, _currentPointPosition);
			_plane.normal;
			_pointIdsSet.clear();
			const quadIds = graph.quadIdsByPointIndex(i);
			if (!quadIds) {
				continue;
			}
			_plane.normal.set(0, 0, 0);
			quadIds.forEach((quadId) => {
				QuadPrimitive.normal(quadObject, quadId, _tmp);
				_plane.normal.add(_tmp);
				quadPrimitiveOppositePoints(quadObject, quadId, i, quadOppositePoints);
				_pointIdsSet.add(quadOppositePoints.p0);
				_pointIdsSet.add(quadOppositePoints.p1);
			});
			if (_pointIdsSet.size <= 2) {
				continue;
			}

			_plane.normal.divideScalar(quadIds.size).normalize();
			_plane.constant = _plane.distanceToPoint(_currentPointPosition);
			_normal.copy(_plane.normal).multiplyScalar(height);

			if (center) {
				_positions.length = 0;
				_pointIdsSet.forEach((pointId, neighbourPointIndex) => {
					QuadPoint.position(quadObject, pointId, _neighbourPosition);
					_plane.projectPoint(_neighbourPosition, _neighbourPositionOnPlane);
					_delta.copy(_neighbourPositionOnPlane).sub(_currentPointPosition);

					_delta.normalize().multiplyScalar(centerSize);
					_neighbourPositionOnPlane.copy(_delta);
					_positions.push(_neighbourPositionOnPlane.clone());
					_neighbourPositionOnPlane.add(_normal);
					_positions.push(_neighbourPositionOnPlane.clone());
				});

				const newGeo = new ConvexGeometry(_positions);
				const object = this.createObject(newGeo, ObjectType.MESH);
				object.position.copy(_currentPointPosition);
				_newObjectsForPoint.push(object);
			}
			if (star) {
				const boxGeometry = new BoxGeometry(
					starSize.x,
					height,
					starSize.y,
					BOX_DIVISIONS,
					BOX_DIVISIONS,
					BOX_DIVISIONS
				);
				const geometries: BufferGeometry[] = [];
				_pointIdsSet.forEach((pointId, neighbourPointIndex) => {
					QuadPoint.position(quadObject, pointId, _neighbourPosition);
					_plane.projectPoint(_neighbourPosition, _neighbourPositionOnPlane);
					_delta.copy(_neighbourPositionOnPlane).sub(_currentPointPosition);

					const currentBoxGeometry = boxGeometry.clone();
					currentBoxGeometry.translate(0, 0, starSize.y * 0.5);
					currentBoxGeometry.lookAt(_delta);
					geometries.push(currentBoxGeometry);
				});
				const mergedGeometry = mergeGeometries(geometries);
				const object = this.createObject(mergedGeometry, ObjectType.MESH);
				object.position.copy(_currentPointPosition);
				_newObjectsForPoint.push(object);
			}
			for (const object of _newObjectsForPoint) {
				ThreejsCoreObject.addAttribute(object, cornersAttribName, _pointIdsSet.size);
				ThreejsCoreObject.addAttribute(object, quadsAttribName, quadIds.size);
				newObjects.push(object);
			}
		}
	}
}
