import {DeleteSopNode} from '../../Delete';
import {BaseCorePoint} from '../../../../../core/geometry/entities/point/CorePoint';
import {Mesh, Vector3, Raycaster, Intersection} from 'three';
import {CoreGroup} from '../../../../../core/geometry/Group';
import {MatDoubleSideTmpSetter} from '../../../../../core/render/MatDoubleSideTmpSetter';

const UP = new Vector3(0, 1, 0);
const DOWN = new Vector3(0, -1, 0);
const _pointPosition = new Vector3();

export class ByBoundingObjectHelper {
	private _matDoubleSideTmpSetter = new MatDoubleSideTmpSetter();

	private _raycaster = new Raycaster();
	private _intersections: Intersection[] = [];

	constructor(private node: DeleteSopNode) {}
	evalForPoints(points: BaseCorePoint[], core_group2?: CoreGroup) {
		if (!core_group2) {
			return;
		}
		const boundingObject = core_group2?.threejsObjectsWithGeo()[0];
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

		for (const point of points) {
			point.position(_pointPosition);

			if (bbox.containsPoint(_pointPosition)) {
				if (
					this._isPositionInObject(_pointPosition, mesh, UP) &&
					this._isPositionInObject(_pointPosition, mesh, DOWN)
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
