import type {World} from '@dimforge/rapier3d';
import {Object3D} from 'three';
import {CorePhysicsAttribute} from '../PhysicsAttribute';
import {_getRBD} from '../PhysicsRBD';
import {CorePlayerPhysics} from './CorePlayerPhysics';
import {PhysicsLib} from '../CorePhysics';
import {PolyScene} from '../../../engine/scene/PolyScene';

const physicsCharacterControllerById: Map<string, CorePlayerPhysics> = new Map();

export enum PhysicsPlayerType {
	CHARACTER_CONTROLLER = 'characterController',
	TORQUE = 'torque',
}

export function clearPhysicsPlayers() {
	physicsCharacterControllerById.forEach((player, id) => {
		player.dispose();
	});

	physicsCharacterControllerById.clear();
}
interface CreateOrFindPhysicsPlayerOptions {
	scene: PolyScene;
	object: Object3D;
	PhysicsLib: PhysicsLib;
	world: World;
	worldObject: Object3D;
}

export function createOrFindPhysicsPlayer(options: CreateOrFindPhysicsPlayerOptions) {
	const {scene, object, PhysicsLib, world, worldObject} = options;
	let player = findPhysicsPlayer(object);
	if (!player) {
		const characterControllerId = CorePhysicsAttribute.getCharacterControllerId(object);
		if (!characterControllerId) {
			return;
		}
		const body = _getRBD(object);
		if (!body) {
			return;
		}
		const collider = body.collider(0);
		if (!collider) {
			return;
		}

		player = new CorePlayerPhysics({
			scene,
			object,
			PhysicsLib,
			world,
			worldObject,
			body,
			collider,
			type: PhysicsPlayerType.TORQUE,
		});
		physicsCharacterControllerById.set(characterControllerId, player);
	}
	// CoreObject.addAttribute(pair.object, PhysicsIdAttribute.DEBUG, nodeId);
	return player;
}
export function findPhysicsPlayer(object: Object3D) {
	const characterControllerId = CorePhysicsAttribute.getCharacterControllerId(object);
	if (!characterControllerId) {
		return;
	}
	return physicsCharacterControllerById.get(characterControllerId);
}
