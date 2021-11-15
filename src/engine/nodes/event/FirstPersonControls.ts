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
import {CorePlayer} from '../../../core/player/Player';
import {CorePlayerKeyEvents} from '../../../core/player/KeyEvents';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {MeshWithBVH} from '../../operations/sop/utils/Bvh/three-mesh-bvh';

const EVENT_LOCK = 'lock';
const EVENT_CHANGE = 'change';
const EVENT_UNLOCK = 'unlock';

// function testOverlay(controls: PointerLockControls) {
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
// 	function removeOverlay() {
// 		console.log('remove');
// 		body.removeChild(overlay);
// 		controls.lock();
// 		overlayActive = false;
// 	}
// 	function addOverlay() {
// 		console.log('add');
// 		body.appendChild(overlay);
// 		controls.unlock();
// 		overlayActive = true;
// 	}

// 	document.body.addEventListener('keydown', (e) => {
// 		console.log(e.code, e.key, overlayActive);
// 		if (!overlayActive && e.key == 'e') {
// 			addOverlay();
// 		}
// 		if (overlayActive && e.key == 'Escape') {
// 			removeOverlay();
// 		}
// 	});
// }

function updatePlayerParamsCallbackOption(): ParamOptions {
	return {
		cook: false,
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
	/** @param click to unlock controls */
	unlock = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FirstPersonControlsEventNode.PARAM_CALLBACK_unlockControls(node as FirstPersonControlsEventNode);
		},
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
		// ...updatePlayerParamsCallbackOption(),
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
	/** @param run Allowed */
	runAllowed = ParamConfig.BOOLEAN(true, {
		...updatePlayerParamsCallbackOption(),
	});
	/** @param run speed mult */
	runSpeedMult = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
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
	/** @param reset */
	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FirstPersonControlsEventNode.PARAM_CALLBACK_resetPlayer(node as FirstPersonControlsEventNode);
		},
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
	private _player: CorePlayer | undefined;
	private _corePlayerKeyEvents: CorePlayerKeyEvents | undefined;

	async createControlsInstance(camera: Camera, element: HTMLElement) {
		await this._initPlayer(camera);
		const controls = new PointerLockControls(camera, element, this._player);

		this._controls_by_element_id.set(element.id, controls);
		this._bind_listeners_to_controls_instance(controls);

		// testOverlay(controls);

		return controls;
	}
	private async _initPlayer(camera: Camera) {
		this._player = this._player || (await this._createPlayer(camera));
		if (!this._player) {
			return;
		}
		this._updatePlayerParams();

		this._player.reset();
	}
	private async _updatePlayerParams() {
		if (!this._player) {
			return;
		}
		this._player.startPosition.copy(this.pv.startPosition);
		this._player.startRotation.copy(this.pv.startRotation);
		this._player.physicsSteps = this.pv.physicsSteps;
		this._player.jumpAllowed = isBooleanTrue(this.pv.jumpAllowed);
		this._player.jumpStrength = this.pv.jumpStrength;
		this._player.runAllowed = isBooleanTrue(this.pv.runAllowed);
		this._player.runSpeedMult = this.pv.runSpeedMult;
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
		const player = new CorePlayer({object: playerObject, collider: collider});

		return player;
	}
	private _resetPlayer() {
		this._player?.reset();
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
			controls.dispose();
			this._controls_by_element_id.delete(html_element_id);
		}
	}
	unlockControls() {
		const controls = this._firstControls();
		if (!controls) {
			return;
		}
		controls.unlock();
	}

	//
	//
	// LOCK
	//
	//
	private lockControls() {
		const controls = this._firstControls();
		if (!controls) {
			return;
		}
		if (this._player) {
			this._corePlayerKeyEvents = this._corePlayerKeyEvents || new CorePlayerKeyEvents(this._player);
			this._corePlayerKeyEvents.addEvents();

			// here we need to detect when the pointerLock is removed, potentially with ESC key,
			// so that we can remove the key events and properly stop the player
			const onPointerlockChange = () => {
				if (!controls) {
					return;
				}
				if (controls.domElement.ownerDocument.pointerLockElement != controls.domElement) {
					controls.domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange);
					this._corePlayerKeyEvents?.removeEvents();
					this._player?.stop();
				}
			};
			controls.domElement.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange);
		}
		controls.lock();
	}
	private _firstControls() {
		let firstControls: PointerLockControls | undefined;
		this._controls_by_element_id.forEach((controls, id) => {
			firstControls = firstControls || controls;
		});
		return firstControls;
	}

	static PARAM_CALLBACK_lockControls(node: FirstPersonControlsEventNode) {
		node.lockControls();
	}
	static PARAM_CALLBACK_unlockControls(node: FirstPersonControlsEventNode) {
		node.unlockControls();
	}
	static PARAM_CALLBACK_updateCollider(node: FirstPersonControlsEventNode) {
		node._updateCollider();
	}
	static PARAM_CALLBACK_updatePlayerParams(node: FirstPersonControlsEventNode) {
		node._updatePlayerParams();
	}
	static PARAM_CALLBACK_resetPlayer(node: FirstPersonControlsEventNode) {
		node._resetPlayer();
	}
}
