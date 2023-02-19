/**
 * Updates an RBD object using left/right/froward/backward/run/jump events
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
import {
	// CorePlayerPhysics,
	CorePlayerPhysicsInput,
	CORE_PLAYER_PHYSICS_INPUTS,
	CorePlayerPhysicsInputData,
	CorePlayerPhysicsComputeInputData,
} from '../../../core/physics/player/CorePlayerPhysics';
import {ParamType} from '../../poly/ParamType';
import {
	// findPhysicsCharacterController,
	findPhysicsPlayer,
} from '../../../core/physics/player/PhysicsPlayer';

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

class PhysicsPlayerUpdateActorParamsConfig extends NodeParamsConfig {
	/** @param travel speed */
	speed = ParamConfig.FLOAT(40, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param run Allowed */
	runAllowed = ParamConfig.BOOLEAN(true);
	/** @param jump Force */
	runSpeedMult = ParamConfig.FLOAT(3, {
		range: [0, 10],
		rangeLocked: [true, false],
		visibleIf: {runAllowed: 1},
	});
	/** @param jump Allowed */
	jumpAllowed = ParamConfig.BOOLEAN(true);
	/** @param jump Force */
	jumpStrength = ParamConfig.FLOAT(30, {
		range: [0, 100],
		rangeLocked: [true, false],
		visibleIf: {jumpAllowed: 1},
	});
	/** @param reset if position is below a threshold */
	resetIfBelowThreshold = ParamConfig.BOOLEAN(true);
	/** @param height under which the player gets reset */
	resetThreshold = ParamConfig.FLOAT(-5, {
		range: [-10, 10],
		rangeLocked: [false, false],
		visibleIf: {resetIfBelowThreshold: 1},
	});
}
const ParamsConfig = new PhysicsPlayerUpdateActorParamsConfig();

export class PhysicsPlayerUpdateActorNode extends TypedActorNode<PhysicsPlayerUpdateActorParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsPlayerUpdate';
	}
	private _playerInputData: CorePlayerPhysicsInputData = {
		forward: false,
		backward: false,
		left: false,
		right: false,
		run: false,
		jump: false,
	};
	private _playerComputeInputData: CorePlayerPhysicsComputeInputData = {
		speed: 2,
		runAllowed: true,
		runSpeedMult: 2,
		jumpAllowed: true,
		jumpStrength: 10,
		resetIfBelowThreshold: true,
		resetThreshold: -5,
	};

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),

			...CORE_PLAYER_PHYSICS_INPUTS.map(
				(inputName) => new ActorConnectionPoint(inputName, ActorConnectionPointType.BOOLEAN, CONNECTION_OPTIONS)
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		const Object3D =
			this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
			context.Object3D;
		const player = findPhysicsPlayer(Object3D);
		if (!player) {
			return;
		}
		// computeInputData
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
		this._playerComputeInputData.resetIfBelowThreshold = this._inputValueFromParam<ParamType.BOOLEAN>(
			this.p.resetIfBelowThreshold,
			context
		);
		this._playerComputeInputData.resetThreshold = this._inputValueFromParam<ParamType.FLOAT>(
			this.p.resetThreshold,
			context
		);

		// inputs
		this._playerInputData.left =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerPhysicsInput.LEFT, context) || false;
		this._playerInputData.right =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerPhysicsInput.RIGHT, context) || false;
		this._playerInputData.backward =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerPhysicsInput.BACKWARD, context) || false;
		this._playerInputData.forward =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerPhysicsInput.FORWARD, context) || false;
		this._playerInputData.run =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerPhysicsInput.RUN, context) || false;
		this._playerInputData.jump =
			this._inputValue<ActorConnectionPointType.BOOLEAN>(CorePlayerPhysicsInput.JUMP, context) || false;

		player.update(this._playerComputeInputData, this._playerInputData, this.scene().timeController.delta());

		this.runTrigger(context);
	}
}
