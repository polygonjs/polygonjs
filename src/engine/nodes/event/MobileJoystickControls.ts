/**
 * Creates a virtual joystick for mobile first person controls
 *
 * @remarks
 * Ensure to have the following tag in your html <head>:
 * <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
 * as this will prevent the screen from zooming in and out when using a finger to translate and another to rotate.
 *
 * And if you are using an iphone, you may need to also add the following css:
 * - to prevent page reload when swiping down
 * body {
 *	overscroll-behavior-y: none;
 *	position: fixed;
 *	overflow: hidden;
 * }
 * - and to disable page zoom from double tap or when using 2 fingers
 * body {
 *	touch-action: none;
 *}
 *
 */
import {Camera} from 'three/src/cameras/Camera';
import {TypedCameraControlsEventNode} from './_BaseCameraControls';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {MobileJoystickControls, DEFAULT_PARAMS} from '../../../modules/core/controls/MobileJoystickControls';
import {CameraControlsNodeType, NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {CorePlayer} from '../../../core/player/Player';
import {ParamOptions} from '../../params/utils/OptionsController';
import {isBooleanTrue} from '../../../core/Type';
import {CollisionController} from './collision/CollisionController';

const EVENT_START = 'start';
const EVENT_CHANGE = 'change';
const EVENT_END = 'end';

function updatePlayerParamsCallbackOption(): ParamOptions {
	return {
		cook: false,
		callback: (node: BaseNodeType) => {
			MobileJoystickControlsEventNode.PARAM_CALLBACK_updatePlayerParams(node as MobileJoystickControlsEventNode);
		},
	};
}

type MobileJoystickControlsMap = Map<string, MobileJoystickControls>;

class MobileJoystickEventParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param collider object */
	colliderObject = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
		// if the node is dependent,
		// the MobileJoystickControlsEventNode will be re-created when this node changes
		// which we do not want, as it will act like a hard reset
		// when all we want is to update the collider
		dependentOnFoundNode: false,
		callback: (node: BaseNodeType) => {
			MobileJoystickControlsEventNode.PARAM_CALLBACK_updateCollider(node as MobileJoystickControlsEventNode);
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
	/** @param translation speed */
	translateSpeed = ParamConfig.FLOAT(1);
	/** @param rotation speed */
	rotateSpeed = ParamConfig.FLOAT(DEFAULT_PARAMS.rotateSpeed);
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
			MobileJoystickControlsEventNode.PARAM_CALLBACK_updateCollider(node as MobileJoystickControlsEventNode);
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
			MobileJoystickControlsEventNode.PARAM_CALLBACK_resetPlayer(node as MobileJoystickControlsEventNode);
		},
	});
	/** @param min polar angle */
	minPolarAngle = ParamConfig.FLOAT('-$PI*0.5', {
		range: [-Math.PI, Math.PI],
		rangeLocked: [true, true],
	});
	/** @param max polar angle */
	maxPolarAngle = ParamConfig.FLOAT('$PI*0.5', {
		range: [-Math.PI, Math.PI],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new MobileJoystickEventParamsConfig();

export class MobileJoystickControlsEventNode extends TypedCameraControlsEventNode<MobileJoystickEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CameraControlsNodeType.MOBILE_JOYSTICK;
	}
	endEventName() {
		return 'end';
	}
	static readonly INPUT_UPDATE_COLLIDER = 'updateCollider';
	private _collisionController: CollisionController | undefined;
	collisionController(): CollisionController {
		return (this._collisionController = this._collisionController || new CollisionController(this));
	}
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(
				MobileJoystickControlsEventNode.INPUT_UPDATE_COLLIDER,
				EventConnectionPointType.BASE,
				this._updateCollider.bind(this)
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(EVENT_START, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_CHANGE, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_END, EventConnectionPointType.BASE),
		]);
	}

	private _controls_by_element_id: MobileJoystickControlsMap = new Map();
	private _player: CorePlayer | undefined;

	async createControlsInstance(camera: Camera, element: HTMLElement) {
		await this._initPlayer(camera);
		const controls = new MobileJoystickControls(camera, element, this._player);

		this._controls_by_element_id.set(element.id, controls);
		this._bind_listeners_to_controls_instance(controls);
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
		this._player.physicsSteps = this.pv.physicsSteps;
		this._player.jumpAllowed = isBooleanTrue(this.pv.jumpAllowed);
		this._player.jumpStrength = this.pv.jumpStrength;
		this._player.runAllowed = isBooleanTrue(this.pv.runAllowed);
		this._player.runSpeedMult = this.pv.runSpeedMult;
		this._player.gravity.copy(this.pv.gravity);
		this._player.speed = this.pv.translateSpeed;
		this._player.setCapsule({radius: this.pv.capsuleRadius, height: this.pv.capsuleHeight});

		this._controls_by_element_id.forEach((controls) => controls.updateElements());
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

	protected _bind_listeners_to_controls_instance(controls: MobileJoystickControls) {
		controls.addEventListener(EVENT_START, () => {
			this.dispatchEventToOutput(EVENT_START, {});
		});
		controls.addEventListener(EVENT_CHANGE, () => {
			this.dispatchEventToOutput(EVENT_CHANGE, {});
		});
		controls.addEventListener(EVENT_END, () => {
			this.dispatchEventToOutput(EVENT_END, {});
		});
	}

	updateRequired() {
		return true;
	}

	setupControls(controls: MobileJoystickControls) {
		controls.setRotationSpeed(this.pv.rotateSpeed);
		controls.setRotationRange({min: this.pv.minPolarAngle, max: this.pv.maxPolarAngle});
		controls.updateElements();
	}

	disposeControlsForHtmlElementId(html_element_id: string) {
		const controls = this._controls_by_element_id.get(html_element_id);
		if (controls) {
			this._controls_by_element_id.delete(html_element_id);
		}
	}

	static PARAM_CALLBACK_updateCollider(node: MobileJoystickControlsEventNode) {
		node._updateCollider();
	}
	static PARAM_CALLBACK_updatePlayerParams(node: MobileJoystickControlsEventNode) {
		node._updatePlayerParams();
	}
	static PARAM_CALLBACK_resetPlayer(node: MobileJoystickControlsEventNode) {
		node._resetPlayer();
	}
}
