/**
 * returns left/right/forward/backward values to be used by updatePlayer
 *
 *
 */

import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {CORE_PLAYER_INPUTS, CorePlayerInput} from '../../../core/player/PlayerCommon';
import {inputObject3D} from './_BaseObject3D';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {ParamlessTypedJsNode} from './_Base';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export class SetPlayerInputJsNode extends ParamlessTypedJsNode {
	static override type() {
		return JsType.SET_PLAYER_INPUT;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			// new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			// new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			...CORE_PLAYER_INPUTS.map(
				(inputName) => new JsConnectionPoint(inputName, JsConnectionPointType.BOOLEAN, CONNECTION_OPTIONS)
			),
		]);
	}

	// override wrappedBodyLines(
	// 	shadersCollectionController: ShadersCollectionController,
	// 	bodyLines: string[],
	// 	existingMethodNames: Set<string>
	// ) {
	// 	const object3D = inputObject3D(this, shadersCollectionController);
	// 	// const keyCodes = this.variableForInputParam(shadersCollectionController, this.p.keyCodes);
	// 	// const ctrlKey = this.variableForInputParam(shadersCollectionController, this.p.ctrlKey);
	// 	// const altKey = this.variableForInputParam(shadersCollectionController, this.p.altKey);
	// 	// const shiftKey = this.variableForInputParam(shadersCollectionController, this.p.shiftKey);
	// 	// const metaKey = this.variableForInputParam(shadersCollectionController, this.p.metaKey);
	// 	// const options: SetPlayerInputOptionsString = {
	// 	// 	stopPropagation: this.variableForInputParam(shadersCollectionController, this.p.stopPropagation),
	// 	// 	useWASDkeys: this.variableForInputParam(shadersCollectionController, this.p.useWASDkeys),
	// 	// 	useArrowkeys: this.variableForInputParam(shadersCollectionController, this.p.useArrowkeys),
	// 	// };
	// 	const optionsStr = JSON.stringify(options);
	// 	const func = Poly.namedFunctionsRegister.getFunction('setPlayerInput', this, shadersCollectionController);
	// 	const bodyLine = func.asString(object3D, optionsStr);

	// 	const methodName = this.type();
	// 	//
	// 	const wrappedLines: string = `${methodName}(){
	// 		${bodyLines.join('\n')}
	// 	}`;
	// 	return {methodNames: [methodName], wrappedLines};
	// }

	override setTriggerableLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		const func = Poly.namedFunctionsRegister.getFunction('setPlayerInput', this, shadersCollectionController);
		const bodyLine = func.asString(object3D);
		shadersCollectionController.addTriggerableLines(this, [bodyLine]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const object3D = inputObject3D(this, shadersCollectionController);

		// action
		// const options: SetPlayerInputOptionsString = {
		// 	stopPropagation: this.variableForInputParam(shadersCollectionController, this.p.stopPropagation),
		// 	useWASDkeys: this.variableForInputParam(shadersCollectionController, this.p.useWASDkeys),
		// 	useArrowkeys: this.variableForInputParam(shadersCollectionController, this.p.useArrowkeys),
		// };
		// const optionsStr = JSON.stringify(options);

		// get
		const usedOutputNames = this.io.outputs.used_output_names();
		const _b = (
			propertyName: CorePlayerInput,
			functionName:
				| 'getPlayerInputDataLeft'
				| 'getPlayerInputDataRight'
				| 'getPlayerInputDataForward'
				| 'getPlayerInputDataBackward'
				| 'getPlayerInputDataRun'
				| 'getPlayerInputDataJump',
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

		_b(CorePlayerInput.LEFT, 'getPlayerInputDataLeft', JsConnectionPointType.BOOLEAN);
		_b(CorePlayerInput.RIGHT, 'getPlayerInputDataRight', JsConnectionPointType.BOOLEAN);
		_b(CorePlayerInput.FORWARD, 'getPlayerInputDataForward', JsConnectionPointType.BOOLEAN);
		_b(CorePlayerInput.BACKWARD, 'getPlayerInputDataBackward', JsConnectionPointType.BOOLEAN);
		_b(CorePlayerInput.JUMP, 'getPlayerInputDataJump', JsConnectionPointType.BOOLEAN);
		_b(CorePlayerInput.RUN, 'getPlayerInputDataRun', JsConnectionPointType.BOOLEAN);
	}
}
