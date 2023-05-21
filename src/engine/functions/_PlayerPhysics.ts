import {Object3D} from 'three';
import {
	CorePlayerPhysics,
	CorePlayerPhysicsInputData,
	CorePlayerPhysicsComputeInputData,
} from '../../core/physics/player/CorePlayerPhysics';
import {findPhysicsPlayer} from '../../core/physics/player/PhysicsPlayer';
import {ObjectNamedFunction1} from './_Base';

function _createInputData(): CorePlayerPhysicsInputData {
	return {forward: false, backward: false, left: false, right: false, run: false, jump: false};
}
function _createComputeData(): CorePlayerPhysicsComputeInputData {
	return {
		speed: 1,
		runAllowed: false,
		runSpeedMult: 2,
		jumpAllowed: false,
		jumpStrength: 2,
		resetIfBelowThreshold: false,
		resetThreshold: -5,
	};
}
interface Element {
	player: CorePlayerPhysics;
	inputData: CorePlayerPhysicsInputData;
	computeData: CorePlayerPhysicsComputeInputData;
}
const _elementByObject3D: WeakMap<Object3D, Element> = new WeakMap();

function _findOrCreateElement(object3D: Object3D): Element | undefined {
	let element = _elementByObject3D.get(object3D);
	if (element) {
		return element;
	}
	const player = findPhysicsPlayer(object3D);
	if (!player) {
		return;
	}
	element = {
		player,
		inputData: _createInputData(),
		computeData: _createComputeData(),
	};
	_elementByObject3D.set(object3D, element);
	return element;
}

interface PlayerUpdateOptions {
	speed: number;
	runAllowed: boolean;
	runSpeedMult: number;
	jumpAllowed: boolean;
	jumpStrength: number;
	resetIfBelowThreshold: boolean;
	resetThreshold: number;
	//
	left: boolean;
	right: boolean;
	backward: boolean;
	forward: boolean;
	run: boolean;
	jump: boolean;
}

export class playerPhysicsUpdate extends ObjectNamedFunction1<[PlayerUpdateOptions]> {
	static override type() {
		return 'playerPhysicsUpdate';
	}
	func(object3D: Object3D, options: PlayerUpdateOptions): void {
		const {
			speed,
			runAllowed,
			runSpeedMult,
			jumpAllowed,
			jumpStrength,
			resetIfBelowThreshold,
			resetThreshold,
			left,
			right,
			backward,
			forward,
			run,
			jump,
		} = options;

		const element = _findOrCreateElement(object3D);
		if (!element) {
			return;
		}
		const {player, inputData, computeData} = element;

		//
		computeData.speed = speed;
		computeData.runAllowed = runAllowed;
		computeData.runSpeedMult = runSpeedMult;
		computeData.jumpAllowed = jumpAllowed;
		computeData.jumpStrength = jumpStrength;
		computeData.resetIfBelowThreshold = resetIfBelowThreshold;
		computeData.resetThreshold = resetThreshold;
		//
		inputData.left = left;
		inputData.right = right;
		inputData.backward = backward;
		inputData.forward = forward;
		inputData.run = run;
		inputData.jump = jump;

		player.update(computeData, inputData, this.scene.timeController.delta());
	}
}
