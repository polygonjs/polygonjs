/**
 * gets globals properties of a point light
 *
 *
 */
import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariablePointLight, ObjectVariableLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {ObjectBuilderAssemblerConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
import {Color} from 'three';
import {LightUserDataRaymarching} from '../../../core/lights/Common';

class GlobalsPointLightJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GlobalsPointLightJsParamsConfig();

export class GlobalsPointLightJsNode extends TypedJsNode<GlobalsPointLightJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GLOBALS_POINT_LIGHT;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(ObjectVariableLight.INTENSITY, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariableLight.COLOR, JsConnectionPointType.COLOR),
			new JsConnectionPoint(ObjectVariablePointLight.DECAY, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariablePointLight.DISTANCE, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariablePointLight.SHADOW_BIAS, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariablePointLight.SHADOW_NEAR, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariablePointLight.SHADOW_FAR, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(LightUserDataRaymarching.PENUMBRA, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(LightUserDataRaymarching.SHADOW_BIAS_ANGLE, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(LightUserDataRaymarching.SHADOW_BIAS_DISTANCE, JsConnectionPointType.FLOAT),
		]);
	}

	override setLines(linesController: JsLinesCollectionController) {
		const bodyLines: string[] = [];

		const usedOutputNames = this.io.outputs.used_output_names();
		for (const outputName of usedOutputNames) {
			const varName = this.jsVarName(outputName);

			switch (outputName) {
				case ObjectVariableLight.INTENSITY:
				case ObjectVariablePointLight.DECAY:
				case ObjectVariablePointLight.DISTANCE: {
					bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName} != null ){
						${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName}
					} else {
						${varName} = 0;
					}`);
					break;
				}
				// case ObjectVariablePointLight.DISTANCE: {
				// 	bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow && ${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera && ${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera.far != null ){
				// 		${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera.far
				// 	} else {
				// 		${varName} = 0;
				// 	}`);
				// 	break;
				// }
				case ObjectVariablePointLight.SHADOW_BIAS:
				case ObjectVariablePointLight.SHADOW_NEAR:
				case ObjectVariablePointLight.SHADOW_FAR: {
					const shadowParameter = outputName.replace('shadow', '').toLowerCase();
					bodyLines.push(`if(
						${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow != null &&
						${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.${shadowParameter} != null )
						{
							${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.${shadowParameter}
						} else {
							${varName} = 0;
						}`);
					break;
				}
				case ObjectVariableLight.COLOR: {
					linesController.addVariable(this, new Color(), varName);
					bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName} != null ){
						${varName}.copy(${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName})
					}`);
					break;
				}
				case LightUserDataRaymarching.PENUMBRA:
				case LightUserDataRaymarching.SHADOW_BIAS_ANGLE:
				case LightUserDataRaymarching.SHADOW_BIAS_DISTANCE: {
					bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.userData['${outputName}'] != null ){
								${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}.userData['${outputName}']
							} else {
								${varName} = 0;
							}`);
				}
			}
		}
		linesController._addBodyLines(this, bodyLines);
	}
}
