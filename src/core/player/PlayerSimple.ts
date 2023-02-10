import {CapsuleSopOperation} from './../../engine/operations/sop/Capsule';
import {Object3D, Vector3, Box3, Line3, Matrix4} from 'three';
import {MeshWithBVH, ExtendedTriangle} from '../../engine/operations/sop/utils/Bvh/three-mesh-bvh';

export enum CorePlayerInput {
	LEFT = 'left',
	RIGHT = 'right',
	BACKWARD = 'backward',
	FORWARD = 'forward',
	RUN = 'run',
	JUMP = 'jump',
}
export const CORE_PLAYER_INPUTS: CorePlayerInput[] = [
	CorePlayerInput.LEFT,
	CorePlayerInput.RIGHT,
	CorePlayerInput.BACKWARD,
	CorePlayerInput.FORWARD,
	CorePlayerInput.RUN,
	CorePlayerInput.JUMP,
];
export type CorePlayerInputData = Record<CorePlayerInput, boolean>;

export interface CorePlayerOptions {
	object: Object3D;
	collider?: MeshWithBVH;
	// meshName?: string;
}
export interface CorePlayerCapsuleInput {
	radius: number;
	height: number;
}
export interface CorePlayerCapsuleData {
	radius: number;
	segment: Line3;
}
function capsuleDataFromInput(input: CorePlayerCapsuleInput): CorePlayerCapsuleData {
	return {
		radius: input.radius,
		segment: new Line3(new Vector3(0, 0, 0), new Vector3(0, -(input.height - 2 * input.radius), 0)),
	};
}

interface BasePlayerComputeInput {
	collider?: MeshWithBVH;
	speed: number;
	runAllowed: boolean;
	runSpeedMult: number;
	jumpAllowed: boolean;
	jumpStrength: number;
	physicsSteps: number;
	gravity: Vector3;
}
export interface CorePlayerComputeInputInputData extends BasePlayerComputeInput {
	capsuleInput: CorePlayerCapsuleInput;
}
export interface PlayerComputeInputData extends BasePlayerComputeInput {
	capsuleData: CorePlayerCapsuleData;
}
export interface PlayerComputedData {
	velocityFromForces: Vector3;
	onGround: boolean;
	velocityFromPositionDelta: Vector3;
}

// type ResetRequiredCallback = () => boolean;
const tmpGravity = new Vector3(0, 0, 0);
const upVector = new Vector3(0, 1, 0);
const tempVector1 = new Vector3();
const tempVector2 = new Vector3();
const tempVector3 = new Vector3();
const tempVector4 = new Vector3();
const tempVector5 = new Vector3();
const tmpPos1 = new Vector3();
const tempBox = new Box3();
const tempMat = new Matrix4();
const tempSegment = new Line3();
// const startRotationRadians = new Vector3();

export class CorePlayer {
	private _inputData: CorePlayerInputData = {
		forward: false,
		backward: false,
		left: false,
		right: false,
		run: false,
		jump: false,
	};
	private _computeInputData: PlayerComputeInputData = {
		collider: undefined,
		speed: 1,
		runAllowed: true,
		runSpeedMult: 2,
		jumpAllowed: true,
		jumpStrength: 1,
		physicsSteps: 5,
		gravity: new Vector3(0, -9.8, 0),
		capsuleData: capsuleDataFromInput({
			radius: CapsuleSopOperation.DEFAULT_PARAMS.radius,
			height: CapsuleSopOperation.DEFAULT_PARAMS.height,
		}),
	};
	private _computedData: PlayerComputedData = {
		velocityFromForces: new Vector3(0, 0, 0),
		onGround: false,
		velocityFromPositionDelta: new Vector3(0, 0, 0),
	};

	constructor(private _object: Object3D) {}
	setComputeInputData(data: CorePlayerComputeInputInputData) {
		this._computeInputData.collider = data.collider;
		this._computeInputData.speed = data.speed;
		this._computeInputData.runSpeedMult = data.runSpeedMult;
		this._computeInputData.jumpStrength = data.jumpStrength;
		this._computeInputData.physicsSteps = data.physicsSteps;
		this._computeInputData.gravity.copy(data.gravity);
		this._computeInputData.speed = data.speed;
		this._computeInputData.capsuleData = capsuleDataFromInput(data.capsuleInput);
	}

	update(delta: number) {
		const deltaBounded = Math.min(delta, 0.1);
		const physicsSteps = this._computeInputData.physicsSteps;
		const deltaNormalized = deltaBounded / physicsSteps;

		tmpPos1.copy(this._object.position);
		for (let i = 0; i < physicsSteps; i++) {
			this._updateStep(deltaNormalized);
		}
		this._computedData.velocityFromPositionDelta.copy(this._object.position).sub(tmpPos1).divideScalar(delta);
	}
	private _updateStep(delta: number) {
		const object = this._object;
		const {onGround, velocityFromForces} = this._computedData;
		const {collider, speed, runSpeedMult, gravity, capsuleData} = this._computeInputData;
		const {left, right, backward, forward, run} = this._inputData;
		if (!onGround) {
			tmpGravity.copy(gravity).multiplyScalar(delta);
			velocityFromForces.add(tmpGravity);
		}
		object.position.addScaledVector(velocityFromForces, delta);

		// move the player
		const angle = 0; //this._azimuthalAngle;
		const speedNormalized = speed * delta * (run ? runSpeedMult : 1);
		tempVector2.set(0, 0, 0);
		if (forward) {
			tempVector1.set(0, 0, -1).applyAxisAngle(upVector, angle);
			tempVector2.add(tempVector1);
		}

		if (backward) {
			tempVector1.set(0, 0, 1).applyAxisAngle(upVector, angle);
			tempVector2.add(tempVector1);
		}

		if (left) {
			tempVector1.set(-1, 0, 0).applyAxisAngle(upVector, angle);
			tempVector2.add(tempVector1);
		}

		if (right) {
			tempVector1.set(1, 0, 0).applyAxisAngle(upVector, angle);
			tempVector2.add(tempVector1);
		}
		tempVector2.normalize().multiplyScalar(speedNormalized);
		object.position.add(tempVector2);

		object.updateMatrix();
		object.updateMatrixWorld();

		if (collider) {
			// adjust player position based on collisions
			tempBox.makeEmpty();
			tempMat.copy(collider.matrixWorld).invert();
			tempSegment.copy(capsuleData.segment);

			// get the position of the capsule in the local space of the collider
			tempSegment.start.applyMatrix4(object.matrixWorld).applyMatrix4(tempMat);
			tempSegment.end.applyMatrix4(object.matrixWorld).applyMatrix4(tempMat);

			// get the axis aligned bounding box of the capsule
			tempBox.expandByPoint(tempSegment.start);
			tempBox.expandByPoint(tempSegment.end);

			tempBox.min.addScalar(-capsuleData.radius);
			tempBox.max.addScalar(capsuleData.radius);

			const intersectsBounds = (
				box: Box3,
				isLeaf: boolean,
				score: number | undefined,
				depth: number,
				nodeIndex: number
			) => {
				return box.intersectsBox(tempBox);
			};
			const intersectsTriangle = (tri: ExtendedTriangle) => {
				// check if the triangle is intersecting the capsule and adjust the
				// capsule position if it is.
				const triPoint = tempVector3;
				const capsulePoint = tempVector4;

				const distance = tri.closestPointToSegment(tempSegment, triPoint, capsulePoint);
				if (distance < capsuleData.radius) {
					const depth = capsuleData.radius - distance;
					const direction = capsulePoint.sub(triPoint).normalize();

					tempSegment.start.addScaledVector(direction, depth);
					tempSegment.end.addScaledVector(direction, depth);
				}
			};
			collider.geometry.boundsTree.shapecast({
				intersectsBounds,

				intersectsTriangle,
			});
			// get the adjusted position of the capsule collider in world space after checking
			// triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
			// the origin of the player model.
			const newPosition = tempVector5;
			// tempSegment.start.y += capsuleInfo.radius;
			newPosition.copy(tempSegment.start);
			newPosition.applyMatrix4(collider.matrixWorld);

			// check how much the collider was moved
			const deltaVector = tempVector2;
			deltaVector.subVectors(newPosition, object.position);

			// if the player was primarily adjusted vertically we assume it's on something we should consider ground
			this._computedData.onGround = deltaVector.y > Math.abs(delta * velocityFromForces.y * 0.25);

			const offset = Math.max(0.0, deltaVector.length() - 1e-5);
			deltaVector.normalize().multiplyScalar(offset);

			// adjust the player model
			object.position.add(deltaVector);

			if (!this._computedData.onGround) {
				deltaVector.normalize();
				velocityFromForces.addScaledVector(deltaVector, -deltaVector.dot(velocityFromForces));
			} else {
				velocityFromForces.set(0, 0, 0);
			}
		}
	}

	setInputData(inputData: CorePlayerInputData) {
		this._inputData.left = inputData.left;
		this._inputData.right = inputData.right;
		this._inputData.backward = inputData.backward;
		this._inputData.forward = inputData.forward;

		if (this._computeInputData.runAllowed && inputData.run && this._computedData.onGround) {
			this._inputData.run = true;
		} else {
			this._inputData.run = false;
		}

		if (this._computeInputData.jumpAllowed && inputData.jump && this._computedData.onGround) {
			this._computedData.velocityFromForces.y = this._computeInputData.jumpStrength;
		}
	}

	velocityFromPositionDelta(target: Vector3) {
		return target.copy(this._computedData.velocityFromPositionDelta);
	}
	onGround() {
		return this._computedData.onGround;
	}
}
