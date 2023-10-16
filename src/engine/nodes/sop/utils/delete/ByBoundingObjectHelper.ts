import {DeleteSopNode} from '../../Delete';
import {CoreEntity} from '../../../../../core/geometry/CoreEntity';
import {Mesh, Vector3, Raycaster, Intersection, Box3} from 'three';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {MatDoubleSideTmpSetter} from '../../../../../core/render/MatDoubleSideTmpSetter';

const UP = new Vector3(0, 1, 0);
const DOWN = new Vector3(0, -1, 0);
const _pointPosition = new Vector3();
const _bbox = new Box3();
const _raycaster = new Raycaster();
const _intersections: Intersection[] = [];

export class ByBoundingObjectHelper {
	private _matDoubleSideTmpSetter = new MatDoubleSideTmpSetter();

	constructor(private node: DeleteSopNode) {}
	evalForEntities(points: CoreEntity[], coreGroup2?: CoreGroup) {
		if (!coreGroup2) {
			return;
		}
		const boundingObject = coreGroup2?.threejsObjectsWithGeo()[0];
		if (!boundingObject) {
			return;
		}
		const mesh = boundingObject as Mesh;
		if (!mesh.isMesh) {
			return;
		}
		this._matDoubleSideTmpSetter.setCoreGroupMaterialDoubleSided(coreGroup2);

		// const geo = boundingObject.geometry;
		// geo.computeBoundingBox();
		// _bbox.copy(geo.boundingBox!).applyMatrix4(boundingObject.matrixWorld);
		_bbox.setFromObject(boundingObject);

		for (const point of points) {
			point.position(_pointPosition);

			if (_bbox.containsPoint(_pointPosition)) {
				if (
					this._isPositionInObject(_pointPosition, mesh, UP) &&
					this._isPositionInObject(_pointPosition, mesh, DOWN)
				) {
					this.node.entitySelectionHelper.select(point);
				}
			}
		}

		this._matDoubleSideTmpSetter.restoreMaterialSideProperty(coreGroup2);
	}
	private _isPositionInObject(point: Vector3, object: Mesh, raydir: Vector3): boolean {
		_raycaster.ray.direction.copy(raydir);
		_raycaster.ray.origin.copy(point);
		_intersections.length = 0;
		const intersections = _raycaster.intersectObject(object, false, _intersections);
		if (!intersections) {
			return false;
		}
		if (intersections.length == 0) {
			return false;
		}
		const intersection = intersections[0];
		const normal = intersection.face?.normal;
		if (!normal) {
			return false;
		}
		const dot = _raycaster.ray.direction.dot(normal);
		return dot >= 0;
	}
}
