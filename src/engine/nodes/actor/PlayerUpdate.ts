/**
 * Updates an object using left/right/froward/backward/run/jump events
 *
 *
 */
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
} from '../utils/io/connections/Actor';
import {Object3D, Vector3} from 'three';
import {
	CorePlayer,
	CorePlayerInput,
	CORE_PLAYER_INPUTS,
	CorePlayerInputData,
	CorePlayerComputeInputInputData,
} from '../../../core/player/PlayerSimple';
import {CapsuleSopOperation} from '../../operations/sop/Capsule';
import {ParamType} from '../../poly/ParamType';
import {MeshWithBVH} from '../../../core/geometry/bvh/three-mesh-bvh';
import {TypeAssert} from '../../poly/Assert';
const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

export enum PlayerUpdateInput {
	COLLIDER = 'collider',
}
export enum PlayerUpdateOutput {
	VELOCITY = 'velocity',
	ON_GROUND = 'onGround',
}
const tmpV3 = new Vector3();

class PlayerUpdateActorParamsConfig extends NodeParamsConfig {
	/** @param travel speed */
	speed = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param run Allowed */
	runAllowed = ParamConfig.BOOLEAN(true);
	/** @param jump Force */
	runSpeedMult = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		visibleIf: {runAllowed: 1},
	});
	/** @param jump Allowed */
	jumpAllowed = ParamConfig.BOOLEAN(true);
	/** @param jump Force */
	jumpStrength = ParamConfig.FLOAT(10, {
		range: [0, 100],
		rangeLocked: [true, false],
		visibleIf: {jumpAllowed: 1},
	});

	/** @param physics Steps */
	physicsSteps = ParamConfig.INTEGER(5, {
		range: [1, 10],
		rangeLocked: [true, false],
		separatorBefore: true,
	});
	/** @param gravity */
	gravity = ParamConfig.VECTOR3([0, -9.8, 0]);
	/** @param collision Capsule Radius */
	capsuleRadius = ParamConfig.FLOAT(CapsuleSopOperation.DEFAULT_PARAMS.radius, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param collision Capsule Height */
	capsuleHeight = ParamConfig.FLOAT(CapsuleSopOperation.DEFAULT_PARAMS.height, {
		range: [0, 2],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new PlayerUpdateActorParamsConfig();

export class PlayerUpdateActorNode extends TypedActorNode<PlayerUpdateActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'playerUpdate';
	}
	private _playerInputData: CorePlayerInputData = {
		forward: false,
		backward: false,
		left: false,
		right: false,
		run: false,
		jump: false,
	};
	private _playerComputeInputData: CorePlayerComputeInputInputData = {
		collider: undefined,
		speed: 2,
		runAllowed: true,
		runSpeedMult: 2,
		jumpAllowed: true,
		jumpStrength: 10,
		physicsSteps: 5,
		gravity: new Vector3(0, -9.8, 0),
		capsuleInput: {
			radius: CapsuleSopOperation.DEFAULT_PARAMS.radius,
			height: CapsuleSopOperation.DEFAULT_PARAMS.height,
		},
	};
	private _playerByObject3D: WeakMap<Object3D, CorePlayer> = new WeakMap();

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
			new ActorConnectionPoint(
				PlayerUpdateInput.COLLIDER,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
			...CORE_PLAYER_INPUTS.map(
				(inputName) => new ActorConnectionPoint(inputName, ActorConnectionPointType.BOOLEAN, CONNECTION_OPTIONS)
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
			new ActorConnectionPoint(PlayerUpdateOutput.ON_GROUND, ActorConnectionPointType.BOOLEAN),
			new ActorConnectionPoint(PlayerUpdateOutput.VELOCITY, ActorConnectionPointType.VECTOR3),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;

		let player = this._playerByObject3D.get(Object3D);
		if (!player) {
			player = new CorePlayer(Object3D);
			this._playerByObject3D.set(Object3D, player);
		}

		// compute data
		const collider = this._inputValue<ActorConnectionPointType.OBJECT_3D>(PlayerUpdateInput.COLLIDER, context);
		if ((collider as MeshWithBVH).geometry && (collider as MeshWithBVH).geometry.boundsTree) {
			this._playerComputeInputData.collider = collider as MeshWithBVH;
		} else {
			this._playerComputeInputData.collider = undefined;
		}

		this._playerComputeInputData.speed = this._inputValueFromParam<ParamType.FLOAT>(this.p.speed, context);
		this._playerComputeInputData.runAllowed = this._inputValueFromParam<ParamType.BOOLEAN>(
			this.p.runAllowed,
			context
		);
		this._playerComputeInputData.runSpeedMult = this._inputValueFromParam<ParamType.FLOAT>(
			this.p.runSpeedMult,
			context
		);
		this._playerComputeInputData.jumpAllowed = this._inputValueFromParam<ParamType.BOOLEAN>(
			this.p.jumpAllowed,
			context
		);
		this._playerComputeInputData.jumpStrength = this._inputValueFromParam<ParamType.FLOAT>(
			this.p.jumpStrength,
			context
		);
		this._playerComputeInputData.physicsSteps = this._inputValueFromParam<ParamType.INTEGER>(
			this.p.physicsSteps,
			context
		);
		this._playerComputeInputData.gravity = this._inputValueFromParam<ParamType.VECTOR3>(this.p.gravity, context);
		this._playerComputeInputData.capsuleInput.radius = this._inputValueFromParam<ParamType.FLOAT>(
			this.p.capsuleRadius,
			context
		);
		this._playerComputeInputData.capsuleInput.height = this._inputValueFromParam<ParamType.FLOAT>(
			this.p.capsuleHeight,
			context
		);

		// inputs
		this._playerInputData.left =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerInput.LEFT, context) || false;
		this._playerInputData.right =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerInput.RIGHT, context) || false;
		this._playerInputData.backward =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerInput.BACKWARD, context) || false;
		this._playerInputData.forward =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerInput.FORWARD, context) || false;
		this._playerInputData.run =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerInput.RUN, context) || false;
		this._playerInputData.jump =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerInput.JUMP, context) || false;

		// apply changes
		player.setComputeInputData(this._playerComputeInputData);
		player.setInputData(this._playerInputData);
		player.update(this.scene().timeController.delta());

		this.runTrigger(context);
	}

	public override outputValue(context: ActorNodeTriggerContext, outputName: PlayerUpdateOutput) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const player = this._playerByObject3D.get(Object3D);

		switch (outputName) {
			case PlayerUpdateOutput.ON_GROUND: {
				if (player) {
					return player.onGround();
				} else {
					return 0;
				}
			}
			case PlayerUpdateOutput.VELOCITY: {
				if (player) {
					player.velocityFromPositionDelta(tmpV3);
				} else {
					tmpV3.set(0, 0, 0);
				}
				return tmpV3;
			}
		}
		TypeAssert.unreachable(outputName);
	}
}
