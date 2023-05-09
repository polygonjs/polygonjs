import {Object3D, Vector3} from 'three';
import {MeshWithBVH} from '../../core/geometry/bvh/three-mesh-bvh';
import {CorePlayer, CorePlayerInputData, CorePlayerComputeInputInputData} from '../../core/player/PlayerSimple';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {CapsuleSopOperation} from '../operations/sop/Capsule';
import {ObjectNamedFunction0, ObjectNamedFunction1} from './_Base';

function _createInputData(): CorePlayerInputData {
	return {forward: false, backward: false, left: false, right: false, run: false, jump: false};
}
function _createComputeData(): CorePlayerComputeInputInputData {
	return {
		collider: undefined,
		speed: 2,
		runAllowed: true,
		runSpeedMult: 2,
		jumpAllowed: true,
		jumpStrength: 10,
		physicsSteps: 5,
		gravity: new Vector3(0, -9.8, 0),
		capsuleInput: {
			radius: CapsuleSopOperation.DEFAULT_PARAMS.radius,
			height: CapsuleSopOperation.DEFAULT_PARAMS.height,
		},
	};
}
interface Element {
	player: CorePlayer;
	inputData: CorePlayerInputData;
	computeData: CorePlayerComputeInputInputData;
}
const _elementByObject3D: WeakMap<Object3D, Element> = new WeakMap();

function _findOrCreateElement(object3D: Object3D): Element {
	let element = _elementByObject3D.get(object3D);
	if (element) {
		return element;
	}
	element = {
		player: new CorePlayer(object3D),
		inputData: _createInputData(),
		computeData: _createComputeData(),
	};
	_elementByObject3D.set(object3D, element);
	return element;
}

interface PlayerUpdateOptions {
	collider: Object3D;
	speed: number;
	runAllowed: boolean;
	runSpeedMult: number;
	jumpAllowed: boolean;
	jumpStrength: number;
	physicsSteps: number;
	gravity: Vector3;
	capsuleRadius: number;
	capsuleHeight: number;
	//
	left: boolean;
	right: boolean;
	backward: boolean;
	forward: boolean;
	run: boolean;
	jump: boolean;
}

export class playerSimpleUpdate extends ObjectNamedFunction1<[PlayerUpdateOptions]> {
	static override type() {
		return 'playerSimpleUpdate';
	}
	func(object3D: Object3D, options: PlayerUpdateOptions): void {
		const {
			collider,
			speed,
			runAllowed,
			runSpeedMult,
			jumpAllowed,
			jumpStrength,
			physicsSteps,
			gravity,
			capsuleRadius,
			capsuleHeight,
			left,
			right,
			backward,
			forward,
			run,
			jump,
		} = options;

		const {player, inputData, computeData} = _findOrCreateElement(object3D);

		if ((collider as MeshWithBVH).geometry && (collider as MeshWithBVH).geometry.boundsTree) {
			computeData.collider = collider as MeshWithBVH;
		} else {
			computeData.collider = undefined;
		}

		//
		computeData.speed = speed;
		computeData.runAllowed = runAllowed;
		computeData.runSpeedMult = runSpeedMult;
		computeData.jumpAllowed = jumpAllowed;
		computeData.jumpStrength = jumpStrength;
		computeData.physicsSteps = physicsSteps;
		computeData.gravity.copy(gravity);
		computeData.capsuleInput.radius = capsuleRadius;
		computeData.capsuleInput.height = capsuleHeight;
		//
		inputData.left = left;
		inputData.right = right;
		inputData.backward = backward;
		inputData.forward = forward;
		inputData.run = run;
		inputData.jump = jump;

		player.setComputeInputData(computeData);
		player.setInputData(inputData);
		player.update(this.scene.timeController.delta());
	}
}

export class getPlayerSimplePropertyOnGround extends ObjectNamedFunction0 {
	static override type() {
		return 'getPlayerSimplePropertyOnGround';
	}
	func(object3D: Object3D): boolean {
		dummyReadRefVal(this.timeController.timeUniform().value);
		const {player} = _findOrCreateElement(object3D);
		return player.onGround();
	}
}
export class getPlayerSimplePropertyVelocity extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'getPlayerSimplePropertyVelocity';
	}
	func(object3D: Object3D, target: Vector3): Vector3 {
		dummyReadRefVal(this.timeController.timeUniform().value);
		const {player} = _findOrCreateElement(object3D);
		player.velocityFromPositionDelta(target);
		return target;
	}
}
