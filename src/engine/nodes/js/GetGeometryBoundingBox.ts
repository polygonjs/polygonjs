/**
 * Get the geometry positions
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {Box3} from 'three';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export const GetGeometryBoundingBoxInputName = {
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D,
};
export enum GetGeometryBoundingBoxOutputName {
	BOX3 = 'Box3',
}

class GetGeometryBoundingBoxJsParamsConfig extends NodeParamsConfig {
	forceCompute = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new GetGeometryBoundingBoxJsParamsConfig();

export class GetGeometryBoundingBoxJsNode extends TypedJsNode<GetGeometryBoundingBoxJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getGeometryBoundingBox';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
			new JsConnectionPoint(GetGeometryBoundingBoxOutputName.BOX3, JsConnectionPointType.BOX3),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);

		const usedOutputNames = this.io.outputs.used_output_names();
		const forceCompute = this.variableForInputParam(linesController, this.p.forceCompute);
		const object3D = inputObject3D(this, linesController);
		const _b3 = (
			propertyName: GetGeometryBoundingBoxOutputName,
			functionName: 'getGeometryBoundingBox',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const tmpVarName = linesController.addVariable(this, new Box3());
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);
			linesController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, forceCompute, tmpVarName),
				},
			]);
		};
		_b3(GetGeometryBoundingBoxOutputName.BOX3, 'getGeometryBoundingBox', JsConnectionPointType.BOX3);
	}
}
