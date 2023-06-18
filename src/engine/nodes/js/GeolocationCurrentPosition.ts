/**
 * returns the current GPS position if the device has access to it
 *
 *
 */

import {ParamlessTypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {Poly} from '../../Poly';
import {WatchedValueJsDefinition} from './utils/JsDefinition';
import {nodeMethodName} from './code/assemblers/actor/ActorAssemblerUtils';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

enum GeolocationCurrentPositionOutput {
	LAT = 'lat',
	LNG = 'lng',
}

export class GeolocationCurrentPositionJsNode extends ParamlessTypedJsNode {
	static override type() {
		return JsType.GEOLOCATION_CURRENT_POSITION;
	}
	override isTriggering() {
		return true;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				GeolocationCurrentPositionOutput.LAT,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				GeolocationCurrentPositionOutput.LNG,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		// outputs
		const usedOutputNames = this.io.outputs.used_output_names();
		const _val = (
			propertyName: string,
			functionName: 'geolocationLatitude' | 'geolocationLongitude',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);
			const varName = this.jsVarName(propertyName);
			// const variable = createVariable(type);
			// if (variable) {
			// 	shadersCollectionController.addVariable(this, variable);
			// }
			linesController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(),
				},
			]);
		};

		_val(GeolocationCurrentPositionOutput.LAT, 'geolocationLatitude', JsConnectionPointType.FLOAT);
		_val(GeolocationCurrentPositionOutput.LNG, 'geolocationLongitude', JsConnectionPointType.FLOAT);
	}

	override setTriggeringLines(linesController: JsLinesCollectionController, triggeredMethods: string) {
		const geolocationCurrentPositionRef = Poly.namedFunctionsRegister.getFunction(
			'geolocationCurrentPositionRef',
			this,
			linesController
		);

		linesController.addDefinitions(this, [
			new WatchedValueJsDefinition(
				this,
				linesController,
				JsConnectionPointType.VECTOR2,
				geolocationCurrentPositionRef.asString(),
				`this.${nodeMethodName(this)}()`,
				{
					deep: true,
				}
			),
		]);

		linesController.addTriggeringLines(this, [triggeredMethods], {
			gatherable: false,
		});
	}

	override setTriggerableLines(linesController: JsLinesCollectionController) {
		const func = Poly.namedFunctionsRegister.getFunction('geolocationGetCurrentPosition', this, linesController);
		const bodyLine = func.asString();
		linesController.addTriggerableLines(this, [bodyLine]);
	}
}
