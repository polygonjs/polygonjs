import {DeleteSopNode} from '../../Delete';
import {CorePoint} from '../../../../../core/geometry/Point';
import {Vector3} from 'three/src/math/Vector3';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {Raycaster, Intersection} from 'three/src/core/Raycaster';
import {Mesh} from 'three/src/objects/Mesh';
import {MatDoubleSideTmpSetter} from '../../../../../core/render/MatDoubleSideTmpSetter';

const UP = new Vector3(0, 1, 0);
const DOWN = new Vector3(0, -1, 0);

export class ByBoundingObjectHelper {
	private _matDoubleSideTmpSetter = new MatDoubleSideTmpSetter();
	private _point_position = new Vector3();
	private _raycaster = new Raycaster();
	private _intersections: Intersection[] = [];

	constructor(private node: DeleteSopNode) {}
	evalForPoints(points: CorePoint[], core_group2?: CoreGroup) {
		if (!core_group2) {
			return;
		}
		const boundingObject = core_group2?.objectsWithGeo()[0];
		if (!boundingObject) {
			return;
		}
		const mesh = boundingObject as Mesh;
		if (!mesh.isMesh) {
			return;
		}
		this._matDoubleSideTmpSetter.setCoreGroupMaterialDoubleSided(core_group2);

		const geo = boundingObject.geometry;
		geo.computeBoundingBox();
		const bbox = geo.boundingBox!;

		for (let point of points) {
			point.getPosition(this._point_position);

			if (bbox.containsPoint(this._point_position)) {
				if (
					this._isPositionInObject(this._point_position, mesh, UP) &&
					this._isPositionInObject(this._point_position, mesh, DOWN)
				) {
					this.node.entitySelectionHelper.select(point);
				}
			}
		}

		this._matDoubleSideTmpSetter.restoreMaterialSideProperty(core_group2);
	}
	private _isPositionInObject(point: Vector3, object: Mesh, raydir: Vector3): boolean {
		this._raycaster.ray.direction.copy(raydir);
		this._raycaster.ray.origin.copy(point);
		this._intersections.length = 0;
		const intersections = this._raycaster.intersectObject(object, false, this._intersections);
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
		const dot = this._raycaster.ray.direction.dot(normal);
		return dot >= 0;
	}
}
