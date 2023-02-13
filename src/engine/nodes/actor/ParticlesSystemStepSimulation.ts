/**
 * Steps through a particles simulation
 *
 *
 */
import {BaseTriggerAndObjectActorNode} from './_BaseTriggerAndObject';
import {stepParticles} from '../../../core/particles/CoreParticles';
import {Object3D} from 'three';

export class ParticlesSystemStepSimulationActorNode extends BaseTriggerAndObjectActorNode {
	static override type() {
		return 'particlesSystemStepSimulation';
	}

	processObject(Object3D: Object3D) {
		stepParticles(Object3D, this.scene().timeController.delta());
	}
}
