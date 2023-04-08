/**
 * sends a trigger on every frame
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ComputedValueJsDefinition} from './utils/JsDefinition';
import {Poly} from '../../Poly';

export enum OnTickJsNodeOuput {
	TIME = 'time',
	DELTA = 'delta',
}

class OnTickJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnTickJsParamsConfig();

export class OnTickJsNode extends TypedJsNode<OnTickJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_TICK;
	}
	override isTriggering() {
		return true;
	}
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
			new JsConnectionPoint(OnTickJsNodeOuput.TIME, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(OnTickJsNodeOuput.DELTA, JsConnectionPointType.FLOAT),
		]);
	}

	override setTriggeringLines(
		shadersCollectionController: ShadersCollectionController,
		triggeredMethods: string
	): void {
		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {gatherable: true});
	}
	override setLines(shadersCollectionController: ShadersCollectionController) {
		const timeVarName = this.jsVarName(OnTickJsNodeOuput.TIME);
		const deltaVarName = this.jsVarName(OnTickJsNodeOuput.DELTA);

		const _time = Poly.namedFunctionsRegister.getFunction('globalsTime', this, shadersCollectionController);
		const _delta = Poly.namedFunctionsRegister.getFunction('globalsTimeDelta', this, shadersCollectionController);
		shadersCollectionController.addDefinitions(this, [
			new ComputedValueJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.FLOAT,
				timeVarName,
				_time.asString()
			),
		]);
		shadersCollectionController.addDefinitions(this, [
			new ComputedValueJsDefinition(
				this,
				shadersCollectionController,
				JsConnectionPointType.FLOAT,
				deltaVarName,
				_delta.asString()
			),
		]);
	}
}
