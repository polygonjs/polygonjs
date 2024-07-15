import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {BufferAttribute, Matrix4, Mesh, Triangle, Vector2, Vector3} from 'three';
import {Intersection} from 'three';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {MatDoubleSideTmpSetter} from '../../../core/render/MatDoubleSideTmpSetter';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {TypeAssert} from '../../poly/Assert';
import {HitPointInfo} from 'three-mesh-bvh';
import {BufferGeometryWithBVH} from '../../../core/geometry/bvh/three-mesh-bvh';
import {ThreeMeshBVHHelper} from '../../../core/geometry/bvh/ThreeMeshBVHHelper';
import {createRaycaster} from '../../../core/RaycastHelper';
import {corePointClassFactory} from '../../../core/geometry/CoreObjectFactory';
import {CoreObjectType} from '../../../core/geometry/ObjectContent';
import {CorePoint} from '../../../core/geometry/entities/point/CorePoint';

export enum RaySopMode {
	PROJECT_RAY = 'project rays',
	MIN_DIST = 'minimum distance',
}
export const RAY_SOP_MODES: RaySopMode[] = [RaySopMode.PROJECT_RAY, RaySopMode.MIN_DIST];

interface RaySopParams extends DefaultOperationParams {
	mode: number;
	useNormals: boolean;
	direction: Vector3;
	transformPoints: boolean;
	transferFaceNormals: boolean;
	transferUVs: boolean;
	addDistAttribute: boolean;
}

const DIST_ATTRIB_NAME = 'dist';

const objectWorldMat = new Matrix4();
const objectWorldMatInverse = new Matrix4();
const _points: CorePoint<CoreObjectType>[] = [];
const _uv0 = new Vector2();
const _uv1 = new Vector2();
const _uv2 = new Vector2();
const _uv = new Vector2();

export class RaySopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: RaySopParams = {
		mode: RAY_SOP_MODES.indexOf(RaySopMode.PROJECT_RAY),
		useNormals: true,
		direction: new Vector3(0, -1, 0),
		transformPoints: true,
		transferFaceNormals: true,
		transferUVs: false,
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
			if (!coreGroup.hasPointAttrib(DIST_ATTRIB_NAME)) {
				const allObjects = coreGroup.allObjects();
				for (const object of allObjects) {
					const corePointClass = corePointClassFactory(object);
					corePointClass.addNumericAttribute(object, DIST_ATTRIB_NAME, 1, -1);
				}
			}
		}

		let direction: Vector3, firstIntersect: Intersection;
		coreGroup.points(_points);
		for (const point of _points) {
			point.position(this._pointPos);
			direction = params.direction;
			if (isBooleanTrue(params.useNormals)) {
				point.normal(this._pointNormal);
				direction = this._pointNormal;
			}
			this._raycaster.set(this._pointPos, direction);
			firstIntersect = this._raycaster.intersectObjects(coreGroupCollision.threejsObjects(), true)[0];
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
		const coreGroupCollisionObject = coreGroupCollision.threejsObjectsWithGeo()[0];
		const collisionGeometry = coreGroupCollisionObject.geometry as BufferGeometryWithBVH;
		const indexArray = collisionGeometry.getIndex()?.array;
		if (!indexArray) {
			this.states?.error.set('the collision geo requires an index');
			return coreGroup;
		}

		// find or create bvh
		let bvh = collisionGeometry.boundsTree;
		if (!bvh) {
			ThreeMeshBVHHelper.assignDefaultBVHIfNone(coreGroupCollisionObject as Mesh);
			bvh = collisionGeometry.boundsTree;
		}

		coreGroupCollisionObject.updateMatrixWorld(true);
		objectWorldMat.copy(coreGroupCollisionObject.matrixWorld);
		objectWorldMatInverse.copy(objectWorldMat).invert();

		// find closest pt
		const position = collisionGeometry.getAttribute('position') as BufferAttribute;
		const uv = collisionGeometry.getAttribute('uv') as BufferAttribute | null;
		coreGroup.points(_points);
		const pointsCount = _points.length;
		for (let i = 0; i < pointsCount; i++) {
			const point = _points[i];
			point.position(this._pointPos);
			// apply object inverse matrix
			this._pointPos.applyMatrix4(objectWorldMatInverse);
			bvh.closestPointToPoint(this._pointPos, this._hitPointInfo);
			if (isBooleanTrue(params.transformPoints)) {
				// apply object matrix when setting the position
				this._hitPointInfo.point.applyMatrix4(objectWorldMat);
				point.setPosition(this._hitPointInfo.point);
			}
			if (isBooleanTrue(params.addDistAttribute)) {
				point.setAttribValue(DIST_ATTRIB_NAME, this._hitPointInfo.distance);
			}
			if (isBooleanTrue(params.transferFaceNormals) || isBooleanTrue(params.transferUVs)) {
				// TODO: test if applying the object matrix is necessary (probably is)
				this._triangle.setFromAttributeAndIndices(
					position,
					indexArray[3 * this._hitPointInfo.faceIndex],
					indexArray[3 * this._hitPointInfo.faceIndex + 1],
					indexArray[3 * this._hitPointInfo.faceIndex + 2]
				);
				if (isBooleanTrue(params.transferFaceNormals)) {
					this._triangle.getNormal(this._faceNormal);
					point.setNormal(this._faceNormal);
				}
				if (isBooleanTrue(params.transferUVs) && uv) {
					_uv0.fromBufferAttribute(uv, indexArray[3 * this._hitPointInfo.faceIndex]);
					_uv1.fromBufferAttribute(uv, indexArray[3 * this._hitPointInfo.faceIndex + 1]);
					_uv2.fromBufferAttribute(uv, indexArray[3 * this._hitPointInfo.faceIndex + 2]);
					this._triangle.getInterpolation(this._hitPointInfo.point, _uv0, _uv1, _uv2, _uv);
					point.setAttribValue('uv', _uv);
				}
			}
		}
		return coreGroup;
	}
}
