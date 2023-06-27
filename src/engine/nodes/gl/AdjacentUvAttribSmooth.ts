/**
 * smoothes an attribute between neighbouring points
 *
 *
 *
 */

import ADJACENT_UV_ATTRIB_SMOOTH from './gl/neighbour/adjacentUvAttribSmooth.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {GlobalsTextureHandler, GlobalsTextureHandlerData} from './code/globals/Texture';
import {GlType} from '../../poly/registers/nodes/types/Gl';

const OUTPUT_NAME = 'attrib';
interface TemplateOptions {
	attribComponent: string;
}

class AdjacentUvAttribSmoothGlParamsConfig extends NodeParamsConfig {
	textureSize = ParamConfig.VECTOR2([128, 128]);
	attribName = ParamConfig.STRING('h');
	attribValue = ParamConfig.FLOAT(0);
	deltaThreshold = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	smoothAmount = ParamConfig.FLOAT(0.01, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new AdjacentUvAttribSmoothGlParamsConfig();
export class AdjacentUvAttribSmoothGlNode extends TypedGlNode<AdjacentUvAttribSmoothGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.ADJACENT_UV_ATTRIB_SMOOTH;
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	glType() {
		return GlConnectionPointType.FLOAT;
	}
	attributeName() {
		return this.pv.attribName;
	}

	override setLines(linesController: ShadersCollectionController) {
		const bodyLines: string[] = [];

		const textureSize = ThreeToGl.vector2(this.variableForInputParam(this.p.textureSize));
		const attribValue = ThreeToGl.float(this.variableForInputParam(this.p.attribValue));
		const deltaThreshold = ThreeToGl.float(this.variableForInputParam(this.p.deltaThreshold));
		const smoothAmount = ThreeToGl.float(this.variableForInputParam(this.p.smoothAmount));

		const out = this.glVarName(OUTPUT_NAME);
		const assembler = linesController.assembler() as BaseGlShaderAssembler;
		const globalsHandler = assembler.globalsHandler();
		if (!globalsHandler) {
			return;
		}
		if ((globalsHandler as GlobalsTextureHandler).attribTextureData) {
			// this._addAdjacencyAttributesToTextureAllocation(
			// 	assembler,
			// 	linesController,
			// 	globalsHandler as GlobalsTextureHandler
			// );
			//
			const globalsTextureHandler = globalsHandler as GlobalsTextureHandler;

			const attribTextureData: GlobalsTextureHandlerData | undefined = globalsTextureHandler.attribTextureData(
				this.pv.attribName
			);
			if (attribTextureData) {
				const {uvName} = attribTextureData;
				const attribTextureName = attribTextureData.textureName;
				const attribComponent = attribTextureData.component;
				const args: string[] = [
					uvName,
					textureSize,
					//
					attribTextureName,
					attribValue,
					deltaThreshold,
					smoothAmount,
				];

				const {functionName, functionDeclaration} = this._templateFunctionDefinition({
					attribComponent,
				});
				linesController.addDefinitions(this, [new FunctionGLDefinition(this, functionDeclaration)]);

				bodyLines.push(`float ${out} = ${functionName}(${args.join(',\n')})`);
			}
		}

		linesController.addBodyLines(this, bodyLines);
	}

	private _templateFunctionDefinition(options: TemplateOptions) {
		//
		const functionName = `${this.type()}${this.graphNodeId()}`;
		const subFunctionName = `sub${this.type()}${this.graphNodeId()}`;
		const functionDeclaration = ADJACENT_UV_ATTRIB_SMOOTH.replace('__FUNCTION__NAME__', functionName)
			.replace(/__SUB_FUNCTION__NAME__/g, subFunctionName)
			.replace('__COMPONENT_ATTRIB__', options.attribComponent);
		return {
			functionName,
			functionDeclaration,
		};
	}
}
