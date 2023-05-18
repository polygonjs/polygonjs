/**
 * sets globals properties of the current spot light
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariableSpotLight, ObjectVariableLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {ObjectBuilderAssemblerConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
import {LightUserDataRaymarching} from '../../../core/lights/Common';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OutputSpotLightJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OutputSpotLightJsParamsConfig();

export class OutputSpotLightJsNode extends TypedJsNode<OutputSpotLightJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.OUTPUT_SPOT_LIGHT;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(ObjectVariableLight.INTENSITY, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableLight.COLOR, JsConnectionPointType.COLOR, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableSpotLight.ANGLE, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableSpotLight.PENUMBRA, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableSpotLight.DECAY, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableSpotLight.DISTANCE, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableSpotLight.SHADOW_BIAS, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableSpotLight.SHADOW_NEAR, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableSpotLight.SHADOW_FAR, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				ObjectVariableSpotLight.SHADOW_RADIUS,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(LightUserDataRaymarching.PENUMBRA, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				LightUserDataRaymarching.SHADOW_BIAS_ANGLE,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				LightUserDataRaymarching.SHADOW_BIAS_DISTANCE,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const inputNames = this.io.inputs.namedInputConnectionPoints().map((c) => c.name());
		const bodyLines: string[] = [];
		if (inputNames) {
			for (const inputName of inputNames) {
				const input = this.io.inputs.named_input(inputName);

				if (input) {
					const varName = this.variableForInput(linesController, inputName);

					switch (inputName) {
						case ObjectVariableLight.INTENSITY:
						case ObjectVariableSpotLight.ANGLE:
						case ObjectVariableSpotLight.PENUMBRA:
						case ObjectVariableSpotLight.DECAY:
						case ObjectVariableSpotLight.DISTANCE: {
							bodyLines.push(`${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName} = ${varName}`);
							break;
						}
						case ObjectVariableSpotLight.SHADOW_BIAS:
						case ObjectVariableSpotLight.SHADOW_NEAR:
						case ObjectVariableSpotLight.SHADOW_FAR:
						case ObjectVariableSpotLight.SHADOW_RADIUS: {
							const shadowParameter = inputName.replace('shadow', '').toLowerCase();
							bodyLines.push(`if(
						${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow != null &&
						${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.${shadowParameter} != null )
						{
							${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.${shadowParameter} = ${varName}
						}`);
							break;
						}
						case ObjectVariableLight.COLOR: {
							// we need to test the presence of the property, as we might not be processing only area lights
							bodyLines.push(`
								if(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName} != null){
									${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName}.copy(${varName})
								}`);
							break;
						}
						case LightUserDataRaymarching.PENUMBRA:
						case LightUserDataRaymarching.SHADOW_BIAS_ANGLE:
						case LightUserDataRaymarching.SHADOW_BIAS_DISTANCE: {
							bodyLines.push(
								`${ObjectBuilderAssemblerConstant.OBJECT_3D}.userData['${inputName}'] = ${varName}`
							);
							break;
						}
					}
				}
			}
		}
		linesController._addBodyLines(this, bodyLines);
	}
}
