import {BaseSopOperation} from './_Base';
import {CoreGroup, Object3DWithGeometry} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Vector3, Object3D, Plane, Mesh} from 'three';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {CoreMask} from '../../../core/geometry/Mask';
import {SopType} from '../../poly/registers/nodes/types/Sop';
import {withChildrenRemoved} from '../../../core/geometry/util/HierarchyRemoved';
import {object3DHasGeometry} from '../../../core/geometry/GeometryUtils';
import {CoreObjectType, ObjectContent} from '../../../core/geometry/ObjectContent';
import {CoreObject} from '../../../core/geometry/Object';
import {meshInverse} from '../../../core/geometry/util/MeshInverse';

const _axis = new Vector3();
const _pos = new Vector3();
const _projectedPos = new Vector3();
const _delta = new Vector3();
const _plane = new Plane();

interface MirrorSopParams extends DefaultOperationParams {
	group: string;
	//
	axis: Vector3;
	center: Vector3;
	preserveInput: boolean;
}

export class MirrorSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: MirrorSopParams = {
		group: '*',
		axis: new Vector3(1, 0, 0),
		center: new Vector3(0, 0, 0),
		preserveInput: true,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<SopType.MIRROR> {
		return SopType.MIRROR;
	}

	override cook(inputCoreGroups: CoreGroup[], params: MirrorSopParams) {
		const coreGroup = inputCoreGroups[0];
		const newObjects = coreGroup.allObjects();
		const objects = CoreMask.filterThreejsObjects(coreGroup, {
			group: params.group,
		}).filter(object3DHasGeometry);
		//
		_axis.copy(params.axis).normalize();
		_plane.constant = -params.center.dot(_axis);
		_plane.normal.copy(_axis);
		//
		for (const object of objects) {
			this._applyOrCreateMirrorObject(object, _plane, params, newObjects);
		}

		return this.createCoreGroupFromObjects(newObjects);
	}
	private _applyOrCreateMirrorObject(
		object: Object3D,
		plane: Plane,
		params: MirrorSopParams,
		newObjects: ObjectContent<CoreObjectType>[]
	) {
		if (params.preserveInput) {
			const clonedObject = withChildrenRemoved<Object3D>(object, () => CoreObject.clone(object));
			this._mirrorObject(clonedObject, plane);
			if (clonedObject) {
				if (object.parent) {
					object.parent.add(clonedObject);
				} else {
					newObjects.push(clonedObject);
				}
			}
		} else {
			this._mirrorObject(object, plane);
		}
	}
	private _mirrorObject(object: Object3D, plane: Plane) {
		const geometry = (object as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const position = geometry.getAttribute('position');
		const pointsCount = position.count;
		const positions = position.array;
		for (let i = 0; i < pointsCount; i++) {
			_pos.fromArray(positions, i * 3);
			plane.projectPoint(_pos, _projectedPos);
			_delta.copy(_pos).sub(_projectedPos);
			_projectedPos.sub(_delta);
			_projectedPos.toArray(positions, i * 3);
		}
		if ((object as Mesh).isMesh) {
			meshInverse(object as Mesh);
		}
	}
}
