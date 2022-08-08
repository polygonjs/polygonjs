import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Mesh, Triangle, Vector3} from 'three';
import {Raycaster, Intersection} from 'three';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {MatDoubleSideTmpSetter} from '../../../core/render/MatDoubleSideTmpSetter';
import {RaycasterForBVH} from './utils/Bvh/three-mesh-bvh';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {TypeAssert} from '../../poly/Assert';
import {BufferGeometryWithBVH} from './utils/Bvh/three-mesh-bvh';
import {HitPointInfo} from 'three-mesh-bvh';
import {ThreeMeshBVHHelper} from './utils/Bvh/ThreeMeshBVHHelper';

export enum RaySopMode {
	PROJECT_RAY = 'project rays',
	MIN_DIST = 'minimum distance',
}
export const RAY_SOP_MODES: RaySopMode[] = [RaySopMode.PROJECT_RAY, RaySopMode.MIN_DIST];

interface RaySopParams extends DefaultOperationParams {
	mode: number;
	useNormals: boolean;
	direction: Vector3;
	transferFaceNormals: boolean;
	transformPoints: boolean;
	addDistAttribute: boolean;
}

const DIST_ATTRIB_NAME = 'dist';

function createRaycaster() {
	const raycaster = new Raycaster() as RaycasterForBVH;
	raycaster.firstHitOnly = true;
	return raycaster;
}

export class RaySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: RaySopParams = {
		mode: RAY_SOP_MODES.indexOf(RaySopMode.PROJECT_RAY),
		useNormals: true,
		direction: new Vector3(0, -1, 0),
		transformPoints: true,
		transferFaceNormals: true,
		addDistAttribute: false,
	};
	static override readonly INPUT_CLONED_STATE = [InputCloneMode.FROM_NODE, InputCloneMode.NEVER];
	static override type(): Readonly<'ray'> {
		return 'ray';
	}

	private _matDoubleSideTmpSetter = new MatDoubleSideTmpSetter();
	private _raycaster = createRaycaster();

	override cook(inputCoreGroups: CoreGroup[], params: RaySopParams) {
		const coreGroupToRay = inputCoreGroups[0];
		const coreGroupToRayOnto = inputCoreGroups[1];

		const coreGroup = this._ray(coreGroupToRay, coreGroupToRayOnto, params);
		return coreGroup;
	}

	private _pointPos = new Vector3();
	private _pointNormal = new Vector3();
	private _hitPointInfo: HitPointInfo = {
		point: new Vector3(),
		distance: -1,
		faceIndex: -1,
	};
	private _triangle = new Triangle();
	private _faceNormal = new Vector3();
	private _ray(coreGroup: CoreGroup, coreGroupCollision: CoreGroup, params: RaySopParams) {
		const mode = RAY_SOP_MODES[params.mode];
		switch (mode) {
			case RaySopMode.PROJECT_RAY: {
				return this._computeWithProjectRay(coreGroup, coreGroupCollision, params);
			}
			case RaySopMode.MIN_DIST: {
				return this._computeWithMinDist(coreGroup, coreGroupCollision, params);
			}
		}
		TypeAssert.unreachable(mode);
	}

	private _computeWithProjectRay(coreGroup: CoreGroup, coreGroupCollision: CoreGroup, params: RaySopParams) {
		this._matDoubleSideTmpSetter.setCoreGroupMaterialDoubleSided(coreGroupCollision);

		if (isBooleanTrue(params.addDistAttribute)) {
			if (!coreGroup.hasAttrib(DIST_ATTRIB_NAME)) {
				coreGroup.addGeoNumericVertexAttrib(DIST_ATTRIB_NAME, 1, -1);
			}
		}

		let direction: Vector3, firstIntersect: Intersection;
		const points = coreGroup.points();
		for (let point of points) {
			point.getPosition(this._pointPos);
			direction = params.direction;
			if (isBooleanTrue(params.useNormals)) {
				point.getNormal(this._pointNormal);
				direction = this._pointNormal;
			}
			this._raycaster.set(this._pointPos, direction);
			firstIntersect = this._raycaster.intersectObjects(coreGroupCollision.objects(), true)[0];
			if (firstIntersect) {
				if (isBooleanTrue(params.transformPoints)) {
					point.setPosition(firstIntersect.point);
				}
				if (isBooleanTrue(params.addDistAttribute)) {
					const dist = this._pointPos.distanceTo(firstIntersect.point);
					point.setAttribValue(DIST_ATTRIB_NAME, dist);
				}
				if (isBooleanTrue(params.transferFaceNormals) && firstIntersect.face) {
					point.setNormal(firstIntersect.face.normal);
				}
			}
		}
		this._matDoubleSideTmpSetter.restoreMaterialSideProperty(coreGroupCollision);
		return coreGroup;
	}
	private _computeWithMinDist(coreGroup: CoreGroup, coreGroupCollision: CoreGroup, params: RaySopParams) {
		const coreGroupCollisionObject = coreGroupCollision.objectsWithGeo()[0];
		const collisionGeometry = coreGroupCollisionObject.geometry as BufferGeometryWithBVH;
		const indexArray = collisionGeometry.getIndex()?.array;
		if (!indexArray) {
			this.states?.error.set('the collision geo requires an index');
			return coreGroup;
		}

		// find or create bvh
		let bvh = collisionGeometry.boundsTree;
		if (!bvh) {
			ThreeMeshBVHHelper.assignBVH(coreGroupCollisionObject as Mesh);
			bvh = collisionGeometry.boundsTree;
		}

		// find closest pt
		const position = collisionGeometry.getAttribute('position');
		const points = coreGroup.points();
		for (let point of points) {
			point.getPosition(this._pointPos);
			bvh.closestPointToPoint(this._pointPos, this._hitPointInfo);

			if (isBooleanTrue(params.transformPoints)) {
				point.setPosition(this._hitPointInfo.point);
			}
			if (isBooleanTrue(params.addDistAttribute)) {
				point.setAttribValue(DIST_ATTRIB_NAME, this._hitPointInfo.distance);
			}
			if (isBooleanTrue(params.transferFaceNormals)) {
				this._triangle.setFromAttributeAndIndices(
					position,
					indexArray[3 * this._hitPointInfo.faceIndex],
					indexArray[3 * this._hitPointInfo.faceIndex + 1],
					indexArray[3 * this._hitPointInfo.faceIndex + 2]
				);
				this._triangle.getNormal(this._faceNormal);
				point.setNormal(this._faceNormal);
			}
		}
		return coreGroup;
	}
}
