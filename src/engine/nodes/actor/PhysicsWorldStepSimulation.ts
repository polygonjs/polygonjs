/**
 * Steps through a physics simulation
 *
 *
 */
import {BaseTriggerAndObjectActorNode} from './_BaseTriggerAndObject';
import {stepWorld} from '../../../core/physics/PhysicsWorld';
import {Object3D} from 'three';

export class PhysicsWorldStepSimulationActorNode extends BaseTriggerAndObjectActorNode {
	static override type() {
		return 'physicsWorldStepSimulation';
	}

	processObject(Object3D: Object3D) {
		stepWorld(Object3D);
	}
}
