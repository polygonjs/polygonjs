/**
 * Get the geometry positions
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputObject3D, setObject3DOutputLine} from './_BaseObject3D';
import {Poly} from '../../Poly';
import {VectorArray} from './code/assemblers/_BaseJsPersistedConfigUtils';
import {Vector3} from 'three';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export const GetGeometryPositionsInputName = {
	[JsConnectionPointType.OBJECT_3D]: JsConnectionPointType.OBJECT_3D,
};
enum GetGeometryPositionsOutputName {
	P = 'positions',
}

class GetGeometryPositionsJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GetGeometryPositionsJsParamsConfig();

export class GetGeometryPositionsJsNode extends TypedJsNode<GetGeometryPositionsJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'getGeometryPositions';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D),
			new JsConnectionPoint(GetGeometryPositionsOutputName.P, JsConnectionPointType.VECTOR3_ARRAY),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		setObject3DOutputLine(this, linesController);

		const usedOutputNames = this.io.outputs.used_output_names();
		const object3D = inputObject3D(this, linesController);
		const _v3 = (
			propertyName: GetGeometryPositionsOutputName,
			functionName: 'getGeometryPositions',
			type: JsConnectionPointType
		) => {
			if (!usedOutputNames.includes(propertyName)) {
				return;
			}
			const varName = this.jsVarName(propertyName);
			const tmpVarName = linesController.addVariable(this, new VectorArray([new Vector3()]));
			const func = Poly.namedFunctionsRegister.getFunction(functionName, this, linesController);
			linesController.addBodyOrComputed(this, [
				{
					dataType: type,
					varName,
					value: func.asString(object3D, tmpVarName),
				},
			]);
		};
		_v3(GetGeometryPositionsOutputName.P, 'getGeometryPositions', JsConnectionPointType.VECTOR3_ARRAY);
	}
}
