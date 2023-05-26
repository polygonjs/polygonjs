import {Object3D} from 'three';
import {resetParticles, stepParticles} from '../../core/particles/CoreParticles';
import {ObjectNamedFunction0, ObjectNamedFunction1} from './_Base';
import {GPUComputationConfigRef} from '../../core/particles/gpuCompute/GPUComputationRenderer';

export class particlesSystemReset extends ObjectNamedFunction0 {
	static override type() {
		return 'particlesSystemReset';
	}
	func(object3D: Object3D): void {
		resetParticles(object3D);
	}
}

export class particlesSystemStepSimulation extends ObjectNamedFunction1<[GPUComputationConfigRef]> {
	static override type() {
		return 'particlesSystemStepSimulation';
	}
	func(object3D: Object3D, configRef: GPUComputationConfigRef): void {
		stepParticles(object3D, this.timeController.delta(), configRef);
	}
}
