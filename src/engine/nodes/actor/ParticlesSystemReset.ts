/**
 * Resets a particles simulation
 *
 *
 */
import {BaseTriggerAndObjectActorNode} from './_BaseTriggerAndObject';
import {resetParticles} from '../../../core/particles/CoreParticles';
import {Object3D} from 'three';

export class ParticlesSystemResetActorNode extends BaseTriggerAndObjectActorNode {
	static override type() {
		return 'particlesSystemReset';
	}

	processObject(Object3D: Object3D) {
		resetParticles(Object3D);
	}
}
