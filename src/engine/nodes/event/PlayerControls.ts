/**
 * Creates a Player object
 *
 * @remarks
 * This allows you to move an object with WASD and arrow keys, and have this object collide with the environment
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {CameraControlsNodeType, NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {TypedEventNode} from './_Base';
import {CorePlayer} from '../../../core/player/Player';
import {CorePlayerKeyEvents} from '../../../core/player/KeyEvents';
import {MeshWithBVH} from '../../operations/sop/utils/Bvh/three-mesh-bvh';
import {Mesh} from 'three/src/objects/Mesh';
import {ParamOptions} from '../../params/utils/OptionsController';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {CameraNodeType} from '../../poly/NodeContext';
import {Camera} from 'three/src/cameras/Camera';
import {Vector3} from 'three/src/math/Vector3';
import {Spherical} from 'three/src/math/Spherical';

const EVENT_INIT = 'init';
const EVENT_DISPOSE = 'dispose';
const EVENT_RESET = 'reset';

function updatePlayerParamsCallbackOption(): ParamOptions {
	return {
		callback: (node: BaseNodeType) => {
			PlayerControlsEventNode.PARAM_CALLBACK_updatePlayerParams(node as PlayerControlsEventNode);
		},
	};
}

const tmpCameraPosition = new Vector3();
const tmpPlayerPosition = new Vector3();
const spherical = new Spherical();

class PlayerEventParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param player object */
	playerObject = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
		},
	});
	/** @param collider object */
	colliderObject = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.SOP,
		},
	});
	/** @param The camera is used in those controls so that the forward direction is away from the camera. This essentially positions the camera always behind the player object, with a third person view. */
	camera = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			types: [CameraNodeType.PERSPECTIVE, CameraNodeType.ORTHOGRAPHIC],
			context: NodeContext.OBJ,
		},
	});
	/** @param create controls */
	initPlayer = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlayerControlsEventNode.PARAM_CALLBACK_initPlayer(node as PlayerControlsEventNode);
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
	/** @param travel speed */
	speed = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
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
	/** @param jump Force */
	runSpeedMult = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		...updatePlayerParamsCallbackOption(),
	});
	/** @param recompute colliding geo */
	updateCollider = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlayerControlsEventNode.PARAM_CALLBACK_updateCollider(node as PlayerControlsEventNode);
		},
	});
	mesh = ParamConfig.FOLDER();
	/** @param player object */
	useMesh = ParamConfig.BOOLEAN(true, {
		callback: (node: BaseNodeType) => {
			PlayerControlsEventNode.PARAM_CALLBACK_updatePlayerMesh(node as PlayerControlsEventNode);
		},
	});
	material = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.MAT,
		},
		callback: (node: BaseNodeType) => {
			PlayerControlsEventNode.PARAM_CALLBACK_updatePlayerMaterial(node as PlayerControlsEventNode);
		},
	});
	init = ParamConfig.FOLDER();
	/** @param start Position */
	startPosition = ParamConfig.VECTOR3([0, 5, 0], {
		...updatePlayerParamsCallbackOption(),
	});
	/** @param reset */
	reset = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			PlayerControlsEventNode.PARAM_CALLBACK_resetPlayer(node as PlayerControlsEventNode);
		},
	});
}
const ParamsConfig = new PlayerEventParamsConfig();

export class PlayerControlsEventNode extends TypedEventNode<PlayerEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return CameraControlsNodeType.PLAYER;
	}

	private _player: CorePlayer | undefined;
	private _corePlayerKeyEvents: CorePlayerKeyEvents | undefined;
	private _cameraObject: Camera | undefined;
	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(EVENT_INIT, EventConnectionPointType.BASE, this._initPlayer.bind(this)),
			new EventConnectionPoint(EVENT_DISPOSE, EventConnectionPointType.BASE, this._disposePlayer.bind(this)),
			new EventConnectionPoint(EVENT_RESET, EventConnectionPointType.BASE, this._resetPlayer.bind(this)),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(EVENT_INIT, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_DISPOSE, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_RESET, EventConnectionPointType.BASE),
		]);
	}
	private async _initPlayer() {
		this._player = this._player || (await this._createPlayer());
		if (!this._player) {
			this.states.error.set('could not create player');
			return;
		}
		this._updatePlayerMesh();
		this._updatePlayerMaterial();
		this._updatePlayerParams();
		this._corePlayerKeyEvents = new CorePlayerKeyEvents(this._player);
		this._corePlayerKeyEvents.addEvents();
		this._player.reset();

		const player = this._player;
		this.scene().registerOnBeforeTick(this._callbackName(), (delta) => {
			player.setAzimuthalAngle(this._getAzimuthalAngle());
			player.update(delta);
		});
		this.dispatchEventToOutput(EVENT_INIT, {});
	}
	private _callbackName() {
		return `event/PlayerControls-${this.graphNodeId()}`;
	}
	private _disposePlayer() {
		if (this._player) {
			this._corePlayerKeyEvents?.removeEvents();
			this.scene().unRegisterOnBeforeTick(this._callbackName());
		}
		this.dispatchEventToOutput(EVENT_DISPOSE, {});
	}
	private _resetPlayer() {
		if (this._player) {
			this._player.reset();
		}
		this.dispatchEventToOutput(EVENT_RESET, {});
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
		this._player.speed = this.pv.speed;
		this._player.setCapsule({radius: this.pv.capsuleRadius, height: this.pv.capsuleHeight});
	}
	private _updatePlayerMesh() {
		if (!this._player) {
			return;
		}
		this._player.setUsePlayerMesh(this.pv.useMesh);
	}
	private async _updatePlayerMaterial() {
		if (!this._player) {
			return;
		}
		const materialNode = this.pv.material.nodeWithContext(NodeContext.MAT);
		if (!materialNode) {
			this.states.error.set('material node not found');
			return;
		}
		const container = await materialNode.compute();
		const material = container.material();
		this._player.setMaterial(material);
	}
	private async _createPlayer() {
		const playerObjectNode = this.pv.playerObject.nodeWithContext(NodeContext.OBJ);
		if (!playerObjectNode) {
			this.states.error.set('player node not found');
			return;
		}
		const cameraNode = this.pv.camera.nodeWithContext(NodeContext.OBJ);
		if (!cameraNode) {
			this.states.error.set('invalid camera node');
			return;
		}
		this._cameraObject = cameraNode.object as Camera;
		const playerObject = playerObjectNode.object as Mesh;
		const collider = await this._getCollider();
		if (!collider) {
			this.states.error.set('invalid collider');
			return;
		}
		const player = new CorePlayer({object: playerObject, collider: collider, meshName: this.path()});

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
	private _getAzimuthalAngle() {
		if (!(this._cameraObject && this._player)) {
			return 0;
		}
		const cameraPosition = this._cameraObject.position;
		const playerPosition = this._player.object.position;
		tmpCameraPosition.copy(cameraPosition);
		tmpPlayerPosition.copy(playerPosition);
		tmpCameraPosition.sub(tmpPlayerPosition);
		spherical.setFromVector3(tmpCameraPosition);
		return spherical.theta;
	}

	static PARAM_CALLBACK_initPlayer(node: PlayerControlsEventNode) {
		node._initPlayer();
	}
	static PARAM_CALLBACK_updatePlayerParams(node: PlayerControlsEventNode) {
		node._updatePlayerParams();
	}
	static PARAM_CALLBACK_updatePlayerMaterial(node: PlayerControlsEventNode) {
		node._updatePlayerMaterial();
	}
	static PARAM_CALLBACK_updatePlayerMesh(node: PlayerControlsEventNode) {
		node._updatePlayerMesh();
	}
	static PARAM_CALLBACK_updateCollider(node: PlayerControlsEventNode) {
		node._updateCollider();
	}
	static PARAM_CALLBACK_resetPlayer(node: PlayerControlsEventNode) {
		node._resetPlayer();
	}
}
