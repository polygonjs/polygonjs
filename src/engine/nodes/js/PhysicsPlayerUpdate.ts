/**
 * Updates an RBD object using left/right/froward/backward/run/jump events
 *
 *
 */
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {CORE_PLAYER_INPUTS} from '../../../core/player/PlayerCommon';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class PhysicsPlayerUpdateJsParamsConfig extends NodeParamsConfig {
	/** @param travel speed */
	speed = ParamConfig.FLOAT(0.5, {
		range: [0, 10],
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
	jumpStrength = ParamConfig.FLOAT(0.2, {
		range: [0, 10],
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
const ParamsConfig = new PhysicsPlayerUpdateJsParamsConfig();

export class PhysicsPlayerUpdateJsNode extends TypedJsNode<PhysicsPlayerUpdateJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'physicsPlayerUpdate';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),

			...CORE_PLAYER_INPUTS.map(
				(inputName) => new JsConnectionPoint(inputName, JsConnectionPointType.BOOLEAN, CONNECTION_OPTIONS)
			),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		// action
		const data: Record<string, string> = {};
		CORE_PLAYER_INPUTS.forEach((inputName) => {
			data[inputName] = this.variableForInput(shadersCollectionController, inputName);
		});
		const params = [
			this.p.speed,
			this.p.runAllowed,
			this.p.runSpeedMult,
			this.p.jumpAllowed,
			this.p.jumpStrength,
			this.p.resetIfBelowThreshold,
			this.p.resetThreshold,
		];
		params.forEach((param) => {
			data[param.name()] = this.variableForInputParam(shadersCollectionController, param);
		});

		const coreInputDict = JSON.stringify(data).replace(/\"/g, '');

		const func = Poly.namedFunctionsRegister.getFunction('playerPhysicsUpdate', this, shadersCollectionController);
		const bodyLine = func.asString(object3D, coreInputDict);
		shadersCollectionController.addActionBodyLines(this, [bodyLine]);
	}
}
