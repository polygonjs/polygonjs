import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {ObjectVariableDirectionalLight, ObjectVariableLight} from './code/assemblers/objectBuilder/ObjectVariables';
import {ObjectBuilderAssemblerConstant} from './code/assemblers/objectBuilder/ObjectBuilderAssemblerCommon';
import {Color} from 'three';
import {LightUserDataRaymarching} from '../../../core/lights/Common';

class GlobalsDirectionalLightJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new GlobalsDirectionalLightJsParamsConfig();

export class GlobalsDirectionalLightJsNode extends TypedJsNode<GlobalsDirectionalLightJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return JsType.GLOBALS_DIRECTIONAL_LIGHT;
	}

	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(ObjectVariableLight.INTENSITY, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariableLight.COLOR, JsConnectionPointType.COLOR),
			new JsConnectionPoint(ObjectVariableDirectionalLight.DISTANCE, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariableDirectionalLight.SHADOW_BIAS, JsConnectionPointType.FLOAT),
			new JsConnectionPoint(ObjectVariableDirectionalLight.SHADOW_RADIUS, JsConnectionPointType.FLOAT),
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
				case ObjectVariableLight.INTENSITY: {
					bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName} != null ){
						${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}.${outputName}
					} else {
						${varName} = 0;
					}`);
					break;
				}
				case ObjectVariableDirectionalLight.DISTANCE: {
					bodyLines.push(`if( ${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow && ${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera && ${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera.far != null ){
						${varName} = ${ObjectBuilderAssemblerConstant.OBJECT_3D}.shadow.camera.far
					} else {
						${varName} = 0;
					}`);
					break;
				}
				case ObjectVariableDirectionalLight.SHADOW_BIAS:
				case ObjectVariableDirectionalLight.SHADOW_RADIUS: {
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
