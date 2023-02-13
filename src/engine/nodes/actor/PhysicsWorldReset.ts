/**
 * Initializes a physics simulation
 *
 *
 */
import {BaseTriggerAndObjectActorNode} from './_BaseTriggerAndObject';
import {getPhysicsWorldNodeFromWorldObject} from '../sop/PhysicsWorld';
import {Object3D} from 'three';

export class PhysicsWorldResetActorNode extends BaseTriggerAndObjectActorNode {
	static override type() {
		return 'physicsWorldReset';
	}

	processObject(Object3D: Object3D) {
		const physicsWorldNode = getPhysicsWorldNodeFromWorldObject(Object3D, this.scene());
		if (!physicsWorldNode) {
			// console.warn(`no ${SopType.PHYSICS_WORLD} node found`);
			return;
		}
		physicsWorldNode.setDirty();
	}
}
