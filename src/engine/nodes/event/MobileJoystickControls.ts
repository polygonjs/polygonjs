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
import {Camera} from 'three';
import {TypedCameraControlsEventNode} from './_BaseCameraControls';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {
	MobileJoystickControls,
	MobileJoystickControlsOptions,
	DEFAULT_PARAMS,
} from '../../../modules/core/controls/MobileJoystickControls';
import {CameraControlsNodeType, NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {CorePlayer, CorePlayerOptions} from '../../../core/player/Player';
import {ParamOptions} from '../../params/utils/OptionsController';
import {isBooleanTrue} from '../../../core/Type';
import {CollisionController} from './collision/CollisionController';
import {CapsuleSopOperation} from '../../operations/sop/Capsule';

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

interface GetElementOptions {
	actionAllowed: boolean;
	customElement: boolean;
	selector: string;
}

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
	capsuleRadius = ParamConfig.FLOAT(CapsuleSopOperation.DEFAULT_PARAMS.radius, {
		range: [0, 1],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});
	/** @param collision Capsule Height */
	capsuleHeight = ParamConfig.FLOAT(CapsuleSopOperation.DEFAULT_PARAMS.height, {
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
	/** @param specify a custom HTML element */
	customTranslateElement = ParamConfig.BOOLEAN(false, {
		separatorBefore: true,
	});
	/** @param jump HTML element selector */
	translateElementSelector = ParamConfig.STRING('#translate-element', {
		visibleIf: {
			customTranslateElement: true,
		},
	});
	/** @param jump Allowed */
	jumpAllowed = ParamConfig.BOOLEAN(true, {
		separatorBefore: true,
		...updatePlayerParamsCallbackOption(),
	});
	/** @param jump Force */
	jumpStrength = ParamConfig.FLOAT(10, {
		range: [0, 100],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});
	/** @param specify a custom HTML element */
	customJumpElement = ParamConfig.BOOLEAN(false, {
		visibleIf: {
			jumpAllowed: true,
		},
	});
	/** @param jump HTML element selector */
	jumpElementSelector = ParamConfig.STRING('#jump-element', {
		visibleIf: {
			jumpAllowed: true,
			customJumpElement: true,
		},
	});
	/** @param run Allowed */
	runAllowed = ParamConfig.BOOLEAN(true, {
		separatorBefore: true,
		...updatePlayerParamsCallbackOption(),
	});
	/** @param run speed mult */
	runSpeedMult = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});
	/** @param specify a custom HTML element */
	customRunElement = ParamConfig.BOOLEAN(false, {
		visibleIf: {
			runAllowed: true,
		},
	});
	/** @param jump HTML element selector */
	runElementSelector = ParamConfig.STRING('#run-element', {
		visibleIf: {
			runAllowed: true,
			customRunElement: true,
		},
	});
	/** @param recompute colliding geo */
	updateCollider = ParamConfig.BUTTON(null, {
		separatorBefore: true,
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

		function _getElement(options: GetElementOptions) {
			if (!options.actionAllowed) {
				return;
			}
			if (!options.customElement) {
				return;
			}
			return document.querySelector<HTMLElement>(options.selector) || undefined;
		}
		const translateDomElement = _getElement({
			actionAllowed: true,
			customElement: this.pv.customTranslateElement,
			selector: this.pv.translateElementSelector,
		});
		const runDomElement = _getElement({
			actionAllowed: this.pv.runAllowed,
			customElement: this.pv.customRunElement,
			selector: this.pv.runElementSelector,
		});
		const jumpDomElement = _getElement({
			actionAllowed: this.pv.jumpAllowed,
			customElement: this.pv.customJumpElement,
			selector: this.pv.jumpElementSelector,
		});
		const options: MobileJoystickControlsOptions = {
			translateDomElement,
			runDomElement,
			jumpDomElement,
		};
		const controls = new MobileJoystickControls(camera, element, options, this._player);

		this._controls_by_element_id.set(element.id, controls);
		this._bind_listeners_to_controls_instance(controls);
		return controls;
	}

	private async _initPlayer(camera: Camera) {
		const options = await this._playerOptions(camera);
		if (!options) {
			return;
		}
		this._player = this._player || new CorePlayer(options);
		// we need to make sure the player is updated with new camera/collision when those change
		this._player.setOptions(options);
		this._updatePlayerParams();
		this._player.reset();
	}
	private async _playerOptions(camera: Camera): Promise<CorePlayerOptions | undefined> {
		const collider = await this.collisionController().getCollider();
		if (!collider) {
			this.states.error.set('invalid collider');
			return;
		}
		return {object: camera, collider: collider};
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
		this._player.setCapsule({
			radius: this.pv.capsuleRadius,
			height: this.pv.capsuleHeight,
			divisions: 5,
			center: CapsuleSopOperation.DEFAULT_PARAMS.center,
		});

		this._controls_by_element_id.forEach((controls) => controls.updateElements());
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
