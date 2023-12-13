/**
 * Builds geometries on quad points
 *
 *
 */
import {QuadSopNode} from './_BaseQuad';
import {Vector3, Plane, Object3D} from 'three';
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
import {ThreejsCoreObject} from '../../index_all';

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

class QuadCornersSopParamsConfig extends NodeParamsConfig {
	size = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [false, false],
	});
	height = ParamConfig.FLOAT(0.1, {
		range: [0, 1],
		rangeLocked: [false, false],
	});
	attribName = ParamConfig.STRING('cornersCount');
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
			const cornerObjects = this._processObject(object);
			newObjects.push(...cornerObjects);
		}

		this.setObjects(newObjects);
	}

	private _processObject(quadObject: QuadObject) {
		const {size, height, attribName} = this.pv;
		const graph = quadGraphFromQuadObject(quadObject);
		const pointsCount = QuadPoint.entitiesCount(quadObject);
		const newObjects: Object3D[] = [];

		for (let i = 0; i < pointsCount; i++) {
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

			//
			_positions.length = 0;
			_pointIdsSet.forEach((pointId, neighbourPointIndex) => {
				QuadPoint.position(quadObject, pointId, _neighbourPosition);
				_plane.projectPoint(_neighbourPosition, _neighbourPositionOnPlane);

				_delta.copy(_neighbourPositionOnPlane).sub(_currentPointPosition);
				_delta.normalize().multiplyScalar(size);
				_neighbourPositionOnPlane.copy(_delta);
				_positions.push(_neighbourPositionOnPlane.clone());
				_neighbourPositionOnPlane.add(_normal);
				_positions.push(_neighbourPositionOnPlane.clone());
			});
			const newGeo = new ConvexGeometry(_positions);
			const object = this.createObject(newGeo, ObjectType.MESH);
			object.position.copy(_currentPointPosition);
			ThreejsCoreObject.addAttribute(object, attribName, _pointIdsSet.size);
			newObjects.push(object);
		}
		return newObjects;
	}
}
