import {Object3D} from 'three';
import {resetParticles, stepParticles} from '../../core/particles/CoreParticles';
import {ShadersCollectionController} from '../nodes/js/code/utils/ShadersCollectionController';
import {BaseNodeType} from '../nodes/_Base';
import {TimeController} from '../scene/utils/TimeController';
import {ObjectNamedFunction0} from './_Base';

export class particlesSystemReset extends ObjectNamedFunction0 {
	static override type() {
		return 'particlesSystemReset';
	}
	func(object3D: Object3D): void {
		resetParticles(object3D);
	}
}

export class particlesSystemStepSimulation extends ObjectNamedFunction0 {
	protected timeController: TimeController;
	constructor(node: BaseNodeType, shadersCollectionController?: ShadersCollectionController) {
		super(node, shadersCollectionController);
		this.timeController = node.scene().timeController;
	}
	static override type() {
		return 'particlesSystemStepSimulation';
	}
	func(object3D: Object3D): void {
		stepParticles(object3D, this.timeController.delta());
	}
}
