/**
 * forwards any input trigger
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

class AnyTriggerJsParamsConfig extends NodeParamsConfig {
	/** @param audio node */
	condition = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new AnyTriggerJsParamsConfig();

export class AnyTriggerJsNode extends TypedJsNode<AnyTriggerJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'anyTrigger';
	}

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
		this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	}

	protected _expectedInputTypes() {
		const current_connections = this.io.connections.existingInputConnections();
		const expected_count = current_connections ? Math.max(current_connections.length + 1, 2) : 2;
		return new Array(expected_count).fill(JsConnectionPointType.TRIGGER);
	}
	protected _expectedOutputTypes() {
		return [JsConnectionPointType.TRIGGER];
	}
	protected _expectedInputName(index: number) {
		return `${JsConnectionPointType.TRIGGER}${index}`;
	}
	protected _expectedOutputName(index: number): string {
		return JsConnectionPointType.TRIGGER;
	}
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		shadersCollectionController.addTriggerableLines(this, []);
	}
}
