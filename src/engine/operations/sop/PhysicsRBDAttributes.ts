import {CorePhysicsAttribute} from './../../../core/physics/PhysicsAttribute';
import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {PhysicsRBDColliderType, PhysicsRBDType} from '../../../core/physics/PhysicsAttribute';
import {Vector3} from 'three';
import {isBooleanTrue} from '../../../core/Type';

interface PhysicsRBDAttributesSopParams extends DefaultOperationParams {
	type: string;
	colliderType: string;
	taddId: boolean;
	id: string;
	// cuboid
	size: Vector3;
	// sphere
	radius: number;
	// capsule
	halfHeight: number;
	// common
	restitution: number;
	linearDamping: number;
	angularDamping: number;
}

export class PhysicsRBDAttributesSopOperation extends BaseSopOperation {
	static override readonly DEFAULT_PARAMS: PhysicsRBDAttributesSopParams = {
		type: PhysicsRBDType.DYNAMIC,
		colliderType: PhysicsRBDColliderType.CUBOID,
		taddId: true,
		id: '',
		// cuboid
		size: new Vector3(0.5, 0.5, 0.5),
		// sphere
		radius: 1,
		// capsule
		halfHeight: 0.5,
		// common
		restitution: 0.5,
		linearDamping: 0,
		angularDamping: 0,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.NEVER;
	static override type(): Readonly<'physicsRBDAttributes'> {
		return 'physicsRBDAttributes';
	}
	override cook(inputCoreGroups: CoreGroup[], params: PhysicsRBDAttributesSopParams) {
		const inputCoreGroup = inputCoreGroups[0];
		const objects = inputCoreGroup.objects();
		for (let object of objects) {
			CorePhysicsAttribute.setRBDType(object, params.type as PhysicsRBDType);
			CorePhysicsAttribute.setColliderType(object, params.colliderType as PhysicsRBDColliderType.CUBOID);
			CorePhysicsAttribute.setRestitution(object, params.restitution);
			CorePhysicsAttribute.setLinearDamping(object, params.linearDamping);
			CorePhysicsAttribute.setAngularDamping(object, params.angularDamping);

			if (isBooleanTrue(params.taddId)) {
				CorePhysicsAttribute.setRBDId(object, params.id);
			}

			switch (params.colliderType as PhysicsRBDColliderType) {
				case PhysicsRBDColliderType.CUBOID: {
					CorePhysicsAttribute.setCuboidSize(object, params.size);
					break;
				}
				case PhysicsRBDColliderType.SPHERE: {
					CorePhysicsAttribute.setRadius(object, params.radius);
					break;
				}
				case PhysicsRBDColliderType.CAPSULE: {
					CorePhysicsAttribute.setHalfHeight(object, params.halfHeight);
					CorePhysicsAttribute.setRadius(object, params.radius);
					break;
				}
			}
		}

		return inputCoreGroup;
	}
}
