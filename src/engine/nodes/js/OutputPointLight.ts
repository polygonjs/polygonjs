/**
 * sets globals properties of the current point light
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JS_CONNECTION_POINT_IN_NODE_DEF, JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariablePointLight, ObjectVariableLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {ObjectBuilderAssemblerConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
import {LightUserDataRaymarching} from '../../../core/lights/Common';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;
class OutputPointLightJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OutputPointLightJsParamsConfig();

export class OutputPointLightJsNode extends TypedJsNode<OutputPointLightJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.OUTPUT_POINT_LIGHT;
	}

	override initializeNode() {
		super.initializeNode();
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(ObjectVariableLight.INTENSITY, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariableLight.COLOR, JsConnectionPointType.COLOR, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariablePointLight.DECAY, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(ObjectVariablePointLight.DISTANCE, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
			new JsConnectionPoint(
				ObjectVariablePointLight.SHADOW_BIAS,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(
				ObjectVariablePointLight.SHADOW_NEAR,
				JsConnectionPointType.FLOAT,
				CONNECTION_OPTIONS
			),
			new JsConnectionPoint(ObjectVariablePointLight.SHADOW_FAR, JsConnectionPointType.FLOAT, CONNECTION_OPTIONS),
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
		const connectionPoints =  this.io.inputs.namedInputConnectionPoints()
		if(!connectionPoints){return}
		const inputNames = connectionPoints.map((c) => c.name());
		const bodyLines: string[] = [];
		if (inputNames) {
			for (const inputName of inputNames) {
				const input = this.io.inputs.named_input(inputName);

				if (input) {
					const varName = this.variableForInput(linesController, inputName);

					switch (inputName) {
						case ObjectVariableLight.INTENSITY:
						case ObjectVariablePointLight.DECAY:
						case ObjectVariablePointLight.DISTANCE: {
							bodyLines.push(`${ObjectBuilderAssemblerConstant.OBJECT_3D}.${inputName} = ${varName}`);
							break;
						}
						// case ObjectVariablePointLight.DISTANCE: {
						// 	bodyLines.push(
						// 		`if(
						// 				${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow != null &&
						// 				${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera != null &&
						// 				${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera.far != null ){
						// 			${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera.far = ${varName}
						// 		}`
						// 	);
						// 	break;
						// }
						case ObjectVariablePointLight.SHADOW_BIAS:
						case ObjectVariablePointLight.SHADOW_NEAR:
						case ObjectVariablePointLight.SHADOW_FAR: {
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
