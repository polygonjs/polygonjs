import type {World} from '@dimforge/rapier3d';
import {Object3D} from 'three';
import {CorePhysicsAttribute} from '../PhysicsAttribute';
import {_getRBD} from '../PhysicsRBD';
import {CorePlayerPhysics} from './CorePlayerPhysics';
import {PhysicsLib} from '../CorePhysics';
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

export function createOrFindPhysicsPlayer(object: Object3D, PhysicsLib: PhysicsLib, world: World) {
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

		player = new CorePlayerPhysics(object, PhysicsLib, world, body, collider);
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
