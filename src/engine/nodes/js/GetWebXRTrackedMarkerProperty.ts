/**
 * get the matrix of a tracked marker
 *
 *
 */

import {TypedJsNode} from './_Base';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {Matrix4} from 'three';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Poly} from '../../Poly';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';

enum GetWebXRTrackedMarkerJsNodeInputName {
	matrix = 'matrix',
}

class GetWebXRTrackedMarkerJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GetWebXRTrackedMarkerJsParamsConfig();

export class GetWebXRTrackedMarkerPropertyJsNode extends TypedJsNode<GetWebXRTrackedMarkerJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'getWebXRTrackedMarkerProperty';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(GetWebXRTrackedMarkerJsNodeInputName.matrix, JsConnectionPointType.MATRIX4),
		]);
	}
	override setLines(shadersCollectionController: JsLinesCollectionController) {
		const usedOutputNames = this.io.outputs.used_output_names();

		const _m4 = (
			propertyName: GetWebXRTrackedMarkerJsNodeInputName,
			functionName: 'getWebXRTrackedMarkerMatrix',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			shadersCollectionController.addVariable(this, varName, new Matrix4());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, shadersCollectionController);
			shadersCollectionController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(varName),
				},
			]);
		};

		_m4(GetWebXRTrackedMarkerJsNodeInputName.matrix, 'getWebXRTrackedMarkerMatrix', JsConnectionPointType.MATRIX4);
	}
}
