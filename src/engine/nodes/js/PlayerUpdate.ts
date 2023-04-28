/**
 * Updates an object using left/right/froward/backward/run/jump events
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {Vector3} from 'three';
import {CORE_PLAYER_INPUTS} from '../../../core/player/PlayerCommon';
import {CapsuleSopOperation} from '../../operations/sop/Capsule';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export enum PlayerUpdateInput {
	COLLIDER = 'collider',
}
export enum PlayerUpdateOutput {
	VELOCITY = 'velocity',
	ON_GROUND = 'onGround',
}

class PlayerUpdateJsParamsConfig extends NodeParamsConfig {
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
const ParamsConfig = new PlayerUpdateJsParamsConfig();

export class PlayerUpdateJsNode extends TypedJsNode<PlayerUpdateJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'playerUpdate';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			// new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			new JsConnectionPoint(PlayerUpdateInput.COLLIDER, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			...CORE_PLAYER_INPUTS.map(
				(inputName) => new JsConnectionPoint(inputName, JsConnectionPointType.BOOLEAN, CONNECTION_OPTIONS)
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(PlayerUpdateOutput.ON_GROUND, JsConnectionPointType.BOOLEAN),
			new JsConnectionPoint(PlayerUpdateOutput.VELOCITY, JsConnectionPointType.VECTOR3),
		]);
	}

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		// action
		const collider = this.variableForInput(shadersCollectionController, PlayerUpdateInput.COLLIDER);
		const data: Record<string, string> = {collider};
		CORE_PLAYER_INPUTS.map((inputName) => {
			data[inputName] = this.variableForInput(shadersCollectionController, inputName);
		});
		const coreInputDict = JSON.stringify(CORE_PLAYER_INPUTS);

		const func = Poly.namedFunctionsRegister.getFunction('playerSimpleUpdate', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, coreInputDict);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}

	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		// get
		const usedOutputNames = this.io.outputs.used_output_names();
		const _b = (
			propertyName: PlayerUpdateOutput,
			functionName: 'getPlayerSimplePropertyOnGround',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D),
				},
			]);
		};
		const _v3 = (
			propertyName: PlayerUpdateOutput,
			functionName: 'getPlayerSimplePropertyVelocity',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const tmpVarName = shadersCollectionController.addVariable(this, new Vector3());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, tmpVarName),
				},
			]);
		};
		_b(PlayerUpdateOutput.ON_GROUND, 'getPlayerSimplePropertyOnGround', JsConnectionPointType.BOOLEAN);
		_v3(PlayerUpdateOutput.VELOCITY, 'getPlayerSimplePropertyVelocity', JsConnectionPointType.VECTOR3);
	}
}
