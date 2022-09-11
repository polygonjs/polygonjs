/**
 * Creates a PointerLockControls
 *
 * @remarks
 * This allows you to create a First-Person navigation, using the WASD keys.
 *
 */
import {Camera} from 'three';
import {TypedCameraControlsEventNode} from './_BaseCameraControls';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {PointerLockControls} from '../../../modules/core/controls/PointerLockControls';
import {CameraControlsNodeType, NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {ParamOptions, StringParamLanguage} from '../../params/utils/OptionsController';
import {CorePlayer} from '../../../core/player/Player';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CollisionController} from './collision/CollisionController';

const EVENT_LOCK = 'lock';
const EVENT_CHANGE = 'change';
const EVENT_UNLOCK = 'unlock';

const lockElementDefault = `
<div style="
	text-align:center;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%,-50%);
	cursor: pointer;
	padding: 5px 10px;
	background:gray;
	border:white;
	color: white;
	">
	<div style="font-size: 1rem">CLICK TO START</div>
	<div style="font-size: 0.6rem">press ESC to show your cursor</div>
</div>
`;

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
		// if the node is dependent,
		// the FirstPersonControls will be re-created when this node changes
		// which we do not want, as it will act like a hard reset
		// when all we want is to update the collider
		dependentOnFoundNode: false,
		callback: (node: BaseNodeType) => {
			FirstPersonControlsEventNode.PARAM_CALLBACK_updateCollider(node as FirstPersonControlsEventNode);
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
	html = ParamConfig.FOLDER();
	/** @param create clickable html element to lock the cursor */
	createHTMLLockElement = ParamConfig.BOOLEAN(1, {
		...updatePlayerParamsCallbackOption(),
	});
	/** @param html used for the lock element */
	htmlLockElement = ParamConfig.STRING(lockElementDefault, {
		...updatePlayerParamsCallbackOption(),
		visibleIf: {createHTMLLockElement: 1},
		language: StringParamLanguage.HTML,
	});
}
const ParamsConfig = new FirstPersonEventParamsConfig();

export class FirstPersonControlsEventNode extends TypedCameraControlsEventNode<FirstPersonEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CameraControlsNodeType.FIRST_PERSON;
	}
	endEventName() {
		return 'unlock';
	}
	static readonly INPUT_UPDATE_COLLIDER = 'updateCollider';
	static readonly INPUT_RESET = 'reset';
	private _collisionController: CollisionController | undefined;
	collisionController(): CollisionController {
		return (this._collisionController = this._collisionController || new CollisionController(this));
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(EVENT_LOCK, EventConnectionPointType.BASE, this.lockControls.bind(this)),
			new EventConnectionPoint(
				FirstPersonControlsEventNode.INPUT_UPDATE_COLLIDER,
				EventConnectionPointType.BASE,
				this._updateCollider.bind(this)
			),
			new EventConnectionPoint(
				FirstPersonControlsEventNode.INPUT_RESET,
				EventConnectionPointType.BASE,
				this._resetPlayer.bind(this)
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(EVENT_LOCK, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_CHANGE, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_UNLOCK, EventConnectionPointType.BASE),
		]);
	}

	protected _controls_by_element_id: PointerLockControlsMap = new Map();
	private _player: CorePlayer | undefined;

	async createControlsInstance(camera: Camera, element: HTMLElement) {
		await this._initPlayer(camera);
		const controls = new PointerLockControls(
			camera,
			element,
			{createLockHTMLElement: this.pv.createHTMLLockElement, lockHTMLElement: this.pv.htmlLockElement},
			this._player
		);

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
	player() {
		return this._player;
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
		this._player.setCapsule({radius: this.pv.capsuleRadius, height: this.pv.capsuleHeight, divisions: 5});
	}
	private async _createPlayer(camera: Camera) {
		const playerObject = camera;
		const collider = await this.collisionController().getCollider();
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

	private async _updateCollider() {
		await this.collisionController().updateCollider();
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
	disposeControlsForHtmlElementId(htmlElementId: string) {
		const controls = this._controls_by_element_id.get(htmlElementId);
		if (controls) {
			controls.dispose();
			this._controls_by_element_id.delete(htmlElementId);
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
