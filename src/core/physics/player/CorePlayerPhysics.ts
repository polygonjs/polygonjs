import type {World, RigidBody, Collider, KinematicCharacterController} from '@dimforge/rapier3d-compat';
import {PhysicsLib} from '../CorePhysics';
import {Object3D, Vector3} from 'three';
import {PhysicsPlayerType} from './PhysicsPlayer';
import {createCharacterController} from './CharacterController';
import {physicsRBDResetAll} from '../PhysicsRBD';
import {CorePhysicsAttribute} from '../PhysicsAttribute';
import {CorePath} from '../../geometry/CorePath';
import {CoreCameraControlsController, ApplicableControlsNode} from '../../camera/CoreCameraControlsController';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {Camera} from 'three';

type BooleanGetter = () => boolean;
type SetInputData = (inputData: CorePlayerPhysicsInputData) => void;
type UpdateFunc = (delta: number) => void;

export enum CorePlayerPhysicsInput {
	LEFT = 'left',
	RIGHT = 'right',
	BACKWARD = 'backward',
	FORWARD = 'forward',
	RUN = 'run',
	JUMP = 'jump',
}
export const CORE_PLAYER_PHYSICS_INPUTS: CorePlayerPhysicsInput[] = [
	CorePlayerPhysicsInput.LEFT,
	CorePlayerPhysicsInput.RIGHT,
	CorePlayerPhysicsInput.BACKWARD,
	CorePlayerPhysicsInput.FORWARD,
	CorePlayerPhysicsInput.RUN,
	CorePlayerPhysicsInput.JUMP,
];
export type CorePlayerPhysicsInputData = Record<CorePlayerPhysicsInput, boolean>;

export interface CorePlayerPhysicsComputeInputData {
	speed: number;
	runAllowed: boolean;
	runSpeedMult: number;
	jumpAllowed: boolean;
	jumpStrength: number;
	resetIfBelowThreshold: boolean;
	resetThreshold: number;
}

interface CorePlayerPhysicsOptions {
	scene: PolyScene;
	object: Object3D;
	PhysicsLib: PhysicsLib;
	world: World;
	worldObject: Object3D;
	body: RigidBody;
	collider: Collider;
	type: PhysicsPlayerType;
}
interface CameraAndControls {
	camera: Camera;
	controlsNode: ApplicableControlsNode;
}

const gravity = new Vector3();
const forcesByDelta = new Vector3();
const desiredTranslation = new Vector3();
const correctedTranslation = new Vector3();
const torqueLR = new Vector3();
const torqueFB = new Vector3();
const up = new Vector3(0, 1, 0);
const forwardDir = new Vector3();
const currentTarget = new Vector3();
const delta = new Vector3();
const newCameraPosition = new Vector3();
const newTarget = new Vector3();
const LERP = 0.2;
export class CorePlayerPhysics {
	private _inputData: CorePlayerPhysicsInputData = {
		forward: false,
		backward: false,
		left: false,
		right: false,
		run: false,
		jump: false,
	};
	private _computeInputData: CorePlayerPhysicsComputeInputData = {
		speed: 1,
		runAllowed: true,
		runSpeedMult: 2,
		jumpAllowed: true,
		jumpStrength: 1,
		resetIfBelowThreshold: true,
		resetThreshold: -5,
	};
	private _mass = 1;
	private _userTorques = new Vector3(0, 0, 0);
	private _userImpulses = new Vector3(0, 0, 0);
	private _userForces = new Vector3(0, 0, 0);
	private _velocity = new Vector3(0, 0, 0);
	private _correctedMovement = new Vector3(0, 0, 0);
	// private _computedData: PlayerComputedData = {
	// 	velocityFromForces: new Vector3(0, 0, 0),
	// 	onGround: false,
	// 	velocityFromPositionDelta: new Vector3(0, 0, 0),
	// };
	protected object: Object3D;
	// protected worldObject: Object3D;
	protected PhysicsLib: PhysicsLib;
	protected world: World;
	protected body: RigidBody;
	protected collider: Collider;
	// protected type: PhysicsPlayerType
	protected characterController: KinematicCharacterController | undefined;
	protected startPosition: Vector3 = new Vector3();
	public onGround: BooleanGetter;
	public setInputData: SetInputData;
	public update: UpdateFunc;
	private cameraAndControls: CameraAndControls | undefined;
	constructor(protected options: CorePlayerPhysicsOptions) {
		this.object = options.object;
		this.PhysicsLib = options.PhysicsLib;
		this.world = options.world;
		this.body = options.body;
		this.collider = options.collider;

		this.startPosition.copy(this.object.position);
		if (options.type == PhysicsPlayerType.CHARACTER_CONTROLLER) {
			this.characterController = createCharacterController(this.world, this.object);
			this.onGround = this.onGroundWithCharacterController;
			this.setInputData = this.setInputDataWithCharacterController;
			this.update = this.updateWithCharacterController;
		} else {
			this.onGround = this.onGroundWithTorque;
			this.setInputData = this.setInputDataWithTorque;
			this.update = this.updateWithTorque;
			this.initWithTorque(options.worldObject, options.scene);
		}
	}

	dispose() {
		if (this.characterController) {
			this.world.removeCharacterController(this.characterController);
		}
	}

	setComputeInputData(data: CorePlayerPhysicsComputeInputData) {
		this._computeInputData.speed = data.speed;
		this._computeInputData.runAllowed = data.runAllowed;
		this._computeInputData.runSpeedMult = data.runSpeedMult;
		this._computeInputData.jumpAllowed = data.jumpAllowed;
		this._computeInputData.jumpStrength = data.jumpStrength;
	}
	private _computeForwardDirAndUpdateCamera() {
		if (!this.cameraAndControls) {
			return;
		}
		const {camera, controlsNode} = this.cameraAndControls;
		forwardDir.set(0, 0, -1).unproject(camera).sub(camera.position);
		forwardDir.y = 0;
		forwardDir.normalize();

		if (controlsNode.target && controlsNode.setTarget) {
			controlsNode.target(currentTarget);
			delta.copy(this.object.position).sub(currentTarget);
			newCameraPosition.copy(camera.position).add(delta);
			camera.position.lerp(newCameraPosition, LERP);
			newTarget.copy(currentTarget).lerp(this.object.position, LERP);
			controlsNode.setTarget(newTarget);
		}
	}

	/**
	 *
	 * torque
	 *
	 */
	initWithTorque(worldObject: Object3D, scene: PolyScene) {
		const cameraPath = CorePhysicsAttribute.getCharacterControllerCameraPath(this.object);
		if (cameraPath == null) {
			return;
		}
		const camera = CorePath.findObjectByMaskInObject(`*/${cameraPath}`, worldObject) as Camera;
		if (!camera) {
			return;
		}
		const controlsNode = CoreCameraControlsController.controlsNode({camera, scene});
		if (!controlsNode) {
			return;
		}
		this.cameraAndControls = {camera, controlsNode};
	}
	onGroundWithTorque(): boolean {
		return Math.abs(this.body.linvel().y) < 0.1;
	}
	setInputDataWithTorque(inputData: CorePlayerPhysicsInputData) {
		this._computeForwardDirAndUpdateCamera();
		this._inputData.left = inputData.left;
		this._inputData.right = inputData.right;
		this._inputData.backward = inputData.backward;
		this._inputData.forward = inputData.forward;

		this._userTorques.set(0, 0, 0);
		this._userImpulses.set(0, 0, 0);
		if (this._computeInputData.runAllowed && inputData.run) {
			this._inputData.run = true;
		} else {
			this._inputData.run = false;
		}
		// jump
		if (this._computeInputData.jumpAllowed && inputData.jump && this.onGround()) {
			this._userImpulses.y += this._computeInputData.jumpStrength * 100;
		}

		// torques
		const speed = this._inputData.run
			? this._computeInputData.speed * this._computeInputData.runSpeedMult
			: this._computeInputData.speed;

		if (this._inputData.left) {
			torqueLR.copy(forwardDir).multiplyScalar(-speed);
			this._userTorques.add(torqueLR);
		} else {
			if (this._inputData.right) {
				torqueLR.copy(forwardDir).multiplyScalar(speed);
				this._userTorques.add(torqueLR);
			}
		}
		if (this._inputData.forward) {
			torqueFB.copy(forwardDir).cross(up).normalize().multiplyScalar(-speed);
			this._userTorques.add(torqueFB);
		} else {
			if (this._inputData.backward) {
				torqueFB.copy(forwardDir).cross(up).normalize().multiplyScalar(speed);
				this._userTorques.add(torqueFB);
			}
		}
	}

	updateWithTorque(delta: number) {
		if (this._computeInputData.resetIfBelowThreshold) {
			if (this.body.translation().y < this._computeInputData.resetThreshold) {
				physicsRBDResetAll(this.object, true);
				this.body.setTranslation(this.startPosition, true);
			}
		}

		this.body.applyTorqueImpulse(this._userTorques, true);
		this.body.applyImpulse(this._userImpulses, true);
	}
	/**
	 *
	 * character controller
	 *
	 */
	onGroundWithCharacterController() {
		return Math.abs(this._correctedMovement.y) < 0.01;
	}

	setInputDataWithCharacterController(inputData: CorePlayerPhysicsInputData) {
		this._inputData.left = inputData.left;
		this._inputData.right = inputData.right;
		this._inputData.backward = inputData.backward;
		this._inputData.forward = inputData.forward;

		this._userForces.set(0, 0, 0);
		const damping = 0.95;
		if (this._computeInputData.runAllowed && inputData.run) {
			this._inputData.run = true;
		} else {
			this._inputData.run = false;
		}

		// console.log(this._computeInputData.jumpAllowed, inputData.jump, this.onGround(), this._correctedMovement.y);
		if (this._computeInputData.jumpAllowed && inputData.jump && this.onGround()) {
			this._userForces.y += this._computeInputData.jumpStrength;
			this._velocity.y = 0;
		}
		const speed = this._inputData.run
			? this._computeInputData.speed * this._computeInputData.runSpeedMult
			: this._computeInputData.speed;

		if (this._inputData.left) {
			this._userForces.x = -speed;
			if (this._velocity.x > 0) {
				this._velocity.x = 0;
			}
		} else {
			if (this._inputData.right) {
				this._userForces.x = speed;
				if (this._velocity.x < 0) {
					this._velocity.x = 0;
				}
			} else {
				this._userForces.x = 0;
				this._velocity.x *= damping;
			}
		}

		if (this._inputData.forward) {
			this._userForces.z = -speed;
			if (this._velocity.z > 0) {
				this._velocity.z = 0;
			}
		} else {
			if (this._inputData.backward) {
				this._userForces.z = speed;
				if (this._velocity.z < 0) {
					this._velocity.z = 0;
				}
			} else {
				this._userForces.z = 0;
				this._velocity.z *= damping;
			}
		}

		// console.log('X', this._inputData.left, this._inputData.right, this._forces.x);
	}
	updateWithCharacterController(delta: number) {
		const characterController = this.characterController!;
		gravity.set(this.world.gravity.x, this.world.gravity.y, this.world.gravity.z);
		forcesByDelta.copy(this._userForces).add(gravity).multiplyScalar(delta).divideScalar(this._mass);
		this._velocity.add(forcesByDelta);
		desiredTranslation.copy(this._velocity).multiplyScalar(delta);
		// console.log(desiredTranslation.x);
		// console.log(this.PhysicsLib.QueryFilterFlags, this.PhysicsLib.QueryFilterFlags.EXCLUDE_KINEMATIC);
		characterController.computeColliderMovement(
			this.collider,
			desiredTranslation
			// undefined,
			// undefined,
			// (collider) => {
			// 	console.log(collider);
			// 	return false;
			// }
		);
		const correctedMovement = characterController.computedMovement();
		this._correctedMovement.set(correctedMovement.x, correctedMovement.y, correctedMovement.z);

		// console.log(correctedMovement.x, correctedMovement.y, correctedMovement.z);
		// const y = correctedMovement.y > 0 && correctedMovement.y < 0.1 ? -0.1 : correctedMovement.y;
		const deltaInv = 1 / delta;
		// const fix = 12;
		// console.log(
		// 	'x',
		// 	this._velocity.x.toFixed(fix),
		// 	desiredTranslation.x.toFixed(fix),
		// 	correctedMovement.x.toFixed(fix),
		// 	(correctedMovement.x * deltaInv).toFixed(fix),
		// 	'y',
		// 	this._velocity.y.toFixed(fix),
		// 	desiredTranslation.y.toFixed(fix),
		// 	correctedMovement.y.toFixed(fix),
		// 	(correctedMovement.y * deltaInv).toFixed(fix),
		// 	Math.abs(this._velocity.x) < 0.000001 ? this.characterController.numComputedCollisions() : null
		// );
		this._velocity.x = correctedMovement.x * deltaInv;
		this._velocity.y = correctedMovement.y * deltaInv;
		this._velocity.z = correctedMovement.z * deltaInv;

		// temporary fix for https://github.com/dimforge/rapier.js/issues/191
		// const expectedVely = correctedMovement.y * deltaInv;
		// this._velocity.y = Math.abs(expectedVely) < 0.1 ? this._velocity.y : expectedVely;
		// if (expectedVely > 0 && this.characterController.numComputedCollisions() > 0) {
		// 	// 	// but that fix breaks when doing auto step
		// 	// console.log(this.characterController.numComputedCollisions());
		// 	this._velocity.y = -0.1;
		// }
		// this._velocity.set(correctedMovement.x, correctedMovement.y, correctedMovement.z).multiplyScalar(deltaInv);
		// this._velocity.y = correctedTranslation.y;
		// if (correctedMovement) {
		// tmpPosition.set(result.correctedMovement.x, result.correctedMovement.y, result.correctedMovement.z);
		// // tmpPosition.add(Object3D.position);
		// console.log(tmpPosition.toArray());
		correctedTranslation.copy(this._correctedMovement).add(this.object.position); //.divideScalar(delta);
		this.body.setNextKinematicTranslation(correctedTranslation);
		// Object3D.position.add(tmpOffset);
		// }

		// TODO: use collisions
		// const collisionsCount = this.characterController.numComputedCollisions()
		// for (let i = 0; i < collisionsCount; i++) {
		// 	// const collision = this.characterController.computedCollision(i);
		// 	// Do something with that collision information.
		// }
	}
}
