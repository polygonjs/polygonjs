/**
 * Creates a PointerLockControls
 *
 * @remarks
 * This allows you to create a First-Person navigation, using the WASD keys.
 *
 */
import {Camera} from 'three/src/cameras/Camera';
import {TypedCameraControlsEventNode} from './_BaseCameraControls';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {PointerLockControls} from '../../../modules/core/controls/PointerLockControls';
import {CameraControlsNodeType, NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {ParamOptions} from '../../params/utils/OptionsController';
import {Player} from '../../../core/player/Player';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {MeshWithBVH} from '../../operations/sop/utils/Bvh/three-mesh-bvh';

const EVENT_LOCK = 'lock';
const EVENT_CHANGE = 'change';
const EVENT_UNLOCK = 'unlock';

function updatePlayerParamsCallbackOption(): ParamOptions {
	return {
		callback: (node: BaseNodeType) => {
			FirstPersonControlsEventNode.PARAM_CALLBACK_updatePlayerParams(node as FirstPersonControlsEventNode);
		},
	};
}

type PointerLockControlsMap = Map<string, PointerLockControls>;

class FirstPersonEventParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param collider object */
	colliderObject = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
	});
	/** @param click to lock controls */
	lock = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FirstPersonControlsEventNode.PARAM_CALLBACK_lockControls(node as FirstPersonControlsEventNode);
		},
	});
	/** @param jump Allowed */
	jumpAllowed = ParamConfig.BOOLEAN(true, {
		...updatePlayerParamsCallbackOption(),
	});
	/** @param jump Force */
	jumpStrength = ParamConfig.FLOAT(10, {
		range: [0, 100],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});
	/** @param translate speed */
	translateSpeed = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});
	/** @param rotate speed */
	rotateSpeed = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});
	/** @param collision Capsule Radius */
	capsuleRadius = ParamConfig.FLOAT(0.5, {
		range: [0, 1],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});
	/** @param collision Capsule Height */
	capsuleHeight = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});

	physics = ParamConfig.FOLDER();
	/** @param physics Steps */
	physicsSteps = ParamConfig.INTEGER(5, {
		range: [1, 10],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});
	/** @param gravity */
	gravity = ParamConfig.VECTOR3([0, -30, 0], {
		...updatePlayerParamsCallbackOption(),
	});
	/** @param recompute colliding geo */
	updateCollider = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FirstPersonControlsEventNode.PARAM_CALLBACK_updateCollider(node as FirstPersonControlsEventNode);
		},
	});
	init = ParamConfig.FOLDER();
	/** @param start Position */
	startPosition = ParamConfig.VECTOR3([0, 2, 0], {
		...updatePlayerParamsCallbackOption(),
	});
	/** @param start Position */
	startRotation = ParamConfig.VECTOR3([0, 0, 0], {
		...updatePlayerParamsCallbackOption(),
	});
	/** @param min rotation angle */
	minPolarAngle = ParamConfig.FLOAT(0, {
		range: [0, Math.PI],
		rangeLocked: [true, true],
	});
	/** @param max rotation angle */
	maxPolarAngle = ParamConfig.FLOAT('$PI', {
		range: [0, Math.PI],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new FirstPersonEventParamsConfig();

export class FirstPersonControlsEventNode extends TypedCameraControlsEventNode<FirstPersonEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return CameraControlsNodeType.FIRST_PERSON;
	}
	endEventName() {
		return 'unlock';
	}

	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(EVENT_LOCK, EventConnectionPointType.BASE, this.lockControls.bind(this)),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(EVENT_LOCK, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_CHANGE, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_UNLOCK, EventConnectionPointType.BASE),
		]);
	}

	protected _controls_by_element_id: PointerLockControlsMap = new Map();
	private _player: Player | undefined;

	async createControlsInstance(camera: Camera, element: HTMLElement) {
		await this._initPlayer(camera);
		const controls = new PointerLockControls(camera, element, this._player);

		this._controls_by_element_id.set(element.id, controls);
		this._bind_listeners_to_controls_instance(controls);

		// function testOverlay(){
		// 	const overlay = document.createElement('div');
		// 	const overlayBody = document.createElement('div');
		// 	const body = document.body;

		// 	overlay.appendChild(overlayBody);
		// 	overlay.style.position = 'absolute';
		// 	overlay.style.top = '0px';
		// 	overlay.style.left = '0px';
		// 	overlay.style.width = '100%';
		// 	overlay.style.height = '100%';
		// 	overlay.style.padding = '50px';
		// 	overlay.style.zIndex = '9999999';
		// 	overlayBody.style.width = '100%';
		// 	overlayBody.style.height = '100%';
		// 	overlayBody.style.backgroundColor = 'white';
		// 	overlayBody.innerText = 'overlay';
		// 	let overlayActive = false;
		// 	function toggleOverlay() {
		// 		if (overlayActive) {
		// 			console.log('remove');
		// 			body.removeChild(overlay);
		// 			controls.lock();
		// 		} else {
		// 			console.log('add');
		// 			body.appendChild(overlay);
		// 			controls.unlock();
		// 		}
		// 		overlayActive = !overlayActive;
		// 	}
		// 	toggleOverlay();
		// 	document.addEventListener('keypress', (e) => {
		// 		console.log(e.code, e.key);
		// 		if (e.key == 'e') {
		// 			toggleOverlay();
		// 		}
		// 	});
		// }
		// testOverlay()

		return controls;
	}
	private async _initPlayer(camera: Camera) {
		this._player = await this._createPlayer(camera);
		if (!this._player) {
			return;
		}
		this._updatePlayerParams();
		this._player.addKeyEvents();
	}
	private async _updatePlayerParams() {
		if (!this._player) {
			return;
		}
		this._player.startPosition.copy(this.pv.startPosition);
		this._player.physicsSteps = this.pv.physicsSteps;
		this._player.jumpAllowed = isBooleanTrue(this.pv.jumpAllowed);
		this._player.jumpStrength = this.pv.jumpStrength;
		this._player.gravity.copy(this.pv.gravity);
		this._player.speed = this.pv.translateSpeed;
		this._player.setCapsule({radius: this.pv.capsuleRadius, height: this.pv.capsuleHeight});
	}
	private async _createPlayer(camera: Camera) {
		const playerObject = camera;
		const collider = await this._getCollider();
		if (!collider) {
			this.states.error.set('invalid collider');
			return;
		}
		const player = new Player({object: playerObject, collider: collider});

		return player;
	}
	private async _getCollider() {
		const colliderNode = this.pv.colliderObject.nodeWithContext(NodeContext.SOP);
		if (!colliderNode) {
			this.states.error.set('collider node not found');
			return;
		}
		const container = await colliderNode.compute();
		const coreGroup = container.coreContent();
		if (!coreGroup) {
			this.states.error.set('invalid collider node');
			return;
		}
		const object = coreGroup.objects()[0] as MeshWithBVH;
		return object;
	}
	private async _updateCollider() {
		const collider = await this._getCollider();
		if (!collider) {
			this.states.error.set('invalid collider');
			return;
		}
		this._player?.setCollider(collider);
	}
	protected _bind_listeners_to_controls_instance(controls: PointerLockControls) {
		controls.addEventListener(EVENT_LOCK, () => {
			// this._createKeysEvents(controls);
			this.dispatchEventToOutput(EVENT_LOCK, {});
		});
		controls.addEventListener(EVENT_CHANGE, () => {
			this.dispatchEventToOutput(EVENT_CHANGE, {});
		});
		controls.addEventListener(EVENT_UNLOCK, () => {
			// this._removeKeysEvents();
			this.dispatchEventToOutput(EVENT_UNLOCK, {});
		});
	}

	updateRequired() {
		return true;
	}

	setupControls(controls: PointerLockControls) {
		controls.minPolarAngle = this.pv.minPolarAngle;
		controls.maxPolarAngle = this.pv.maxPolarAngle;
		controls.rotateSpeed = this.pv.rotateSpeed;
	}
	disposeControlsForHtmlElementId(html_element_id: string) {
		const controls = this._controls_by_element_id.get(html_element_id);
		if (controls) {
			this._controls_by_element_id.delete(html_element_id);
		}
	}

	// private _recomputeCollidingGeo() {
	// 	this._controls_by_element_id.forEach((controls, id) => {
	// 		this._setupCollisionGeo(controls);
	// 	});
	// }

	//
	//
	// LOCK
	//
	//
	private lockControls() {
		let firstControls: PointerLockControls | undefined;
		this._controls_by_element_id.forEach((controls, id) => {
			firstControls = firstControls || controls;
		});
		if (!firstControls) {
			return;
		}
		firstControls.lock();
	}

	//
	//
	// KEYBOARD
	//
	//
	// private _onKeyDown(event: KeyboardEvent, controls: PointerLockControls) {
	// 	switch (event.code) {
	// 		case 'ArrowUp':
	// 		case 'KeyW':
	// 			controls.setMoveForward(true);
	// 			break;

	// 		case 'ArrowLeft':
	// 		case 'KeyA':
	// 			controls.setMoveLeft(true);
	// 			break;

	// 		case 'ArrowDown':
	// 		case 'KeyS':
	// 			controls.setMoveBackward(true);
	// 			break;

	// 		case 'ArrowRight':
	// 		case 'KeyD':
	// 			controls.setMoveRight(true);
	// 			break;
	// 		case 'Space':
	// 			controls.jump();
	// 			break;

	// 		// case 'Space':
	// 		// 	if ( canJump === true ) velocity.y += 350;
	// 		// 	canJump = false;
	// 		// 	break;
	// 	}
	// }
	// private _onKeyUp(event: KeyboardEvent, controls: PointerLockControls) {
	// 	switch (event.code) {
	// 		case 'ArrowUp':
	// 		case 'KeyW':
	// 			controls.setMoveForward(false);
	// 			break;

	// 		case 'ArrowLeft':
	// 		case 'KeyA':
	// 			controls.setMoveLeft(false);
	// 			break;

	// 		case 'ArrowDown':
	// 		case 'KeyS':
	// 			controls.setMoveBackward(false);
	// 			break;

	// 		case 'ArrowRight':
	// 		case 'KeyD':
	// 			controls.setMoveRight(false);
	// 			break;
	// 	}
	// }
	// private _onKeyDownBound: ((event: KeyboardEvent) => void) | undefined;
	// private _onKeyUpBound: ((event: KeyboardEvent) => void) | undefined;
	// private _createKeysEvents(controls: PointerLockControls) {
	// 	this._onKeyDownBound = (event: KeyboardEvent) => {
	// 		this._onKeyDown(event, controls);
	// 	};
	// 	this._onKeyUpBound = (event: KeyboardEvent) => {
	// 		this._onKeyUp(event, controls);
	// 	};
	// 	document.addEventListener('keydown', this._onKeyDownBound);
	// 	document.addEventListener('keyup', this._onKeyUpBound);
	// }
	// private _removeKeysEvents() {
	// 	if (this._onKeyDownBound && this._onKeyUpBound) {
	// 		document.removeEventListener('keydown', this._onKeyDownBound);
	// 		document.removeEventListener('keyup', this._onKeyUpBound);
	// 	}
	// }

	static PARAM_CALLBACK_lockControls(node: FirstPersonControlsEventNode) {
		node.lockControls();
	}
	static PARAM_CALLBACK_updateCollider(node: FirstPersonControlsEventNode) {
		node._updateCollider();
	}
	static PARAM_CALLBACK_updatePlayerParams(node: FirstPersonControlsEventNode) {
		node._updatePlayerParams();
	}
}
