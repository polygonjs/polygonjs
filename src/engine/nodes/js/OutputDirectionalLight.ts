/**
 * sets globals properties of the current directional light
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariableDirectionalLight, ObjectVariableLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {ObjectBuilderAssemblerConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
import {LightUserDataRaymarching} from '../../../core/lights/Common';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OutputDirectionalLightJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OutputDirectionalLightJsParamsConfig();

export class OutputDirectionalLightJsNode extends TypedJsNode<OutputDirectionalLightJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.OUTPUT_DIRECTIONAL_LIGHT;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(ObjectVariableLight.INTENSITY, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableLight.COLOR, JsConnectionPointType.COLOR, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				ObjectVariableDirectionalLight.DISTANCE,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				ObjectVariableDirectionalLight.SHADOW_BIAS,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				ObjectVariableDirectionalLight.SHADOW_RADIUS,
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
						case ObjectVariableLight.INTENSITY: {
							bodyLines.push(`${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName} = ${varName}`);
							break;
						}
						case ObjectVariableDirectionalLight.DISTANCE: {
							bodyLines.push(
								`if(
										${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow != null &&
										${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera != null &&
										${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera.far != null ){
									${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera.far = ${varName}
								}`
							);
							break;
						}
						case ObjectVariableDirectionalLight.SHADOW_BIAS:
						case ObjectVariableDirectionalLight.SHADOW_RADIUS: {
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
