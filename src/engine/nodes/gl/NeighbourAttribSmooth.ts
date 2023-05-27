/**
 * smoothes an attribute between neighbouring points
 *
 *
 *
 */

import ATTRIB_SMOOTH from './gl/neighbour/attribSmooth.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {GlobalsTextureHandler} from './code/globals/Texture';

const OUTPUT_NAME = 'attrib';
interface TemplateOptions {
	positionComponent: string;
	attribComponent: string;
}

class NeighbourAttribSmoothGlParamsConfig extends NodeParamsConfig {
	positionAttribName = ParamConfig.STRING('position');
	position = ParamConfig.VECTOR3([0, 0, 0], {
		separatorAfter: true,
	});
	// attribType = ParamConfig.INTEGER(GL_CONNECTION_POINT_TYPES.indexOf(GlConnectionPointType.FLOAT), {
	// 	menu: {
	// 		entries: GL_CONNECTION_POINT_TYPES.map((name, i) => {
	// 			return {name: name, value: i};
	// 		}),
	// 	},
	// 	separatorBefore: true,
	// });
	attribName = ParamConfig.STRING('h');
	attribValue = ParamConfig.FLOAT(0);
	maxDist = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		separatorBefore: true,
	});
	deltaThreshold = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	smoothAmount = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new NeighbourAttribSmoothGlParamsConfig();
export class NeighbourAttribSmoothGlNode extends TypedGlNode<NeighbourAttribSmoothGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'neighbourAttribSmooth';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.FLOAT),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const bodyLines: string[] = [];

		const position = ThreeToGl.vector3(this.variableForInputParam(this.p.position));
		const maxDist = ThreeToGl.float(this.variableForInputParam(this.p.maxDist));
		const attribValue = ThreeToGl.float(this.variableForInputParam(this.p.attribValue));
		const deltaThreshold = ThreeToGl.float(this.variableForInputParam(this.p.deltaThreshold));
		const smoothAmount = ThreeToGl.float(this.variableForInputParam(this.p.smoothAmount));

		// TODO:
		// - ensure that in the for loop the number of particles is known so that we don't look up non existing ones
		const out = this.glVarName(OUTPUT_NAME);
		const assembler = shadersCollectionController.assembler() as BaseGlShaderAssembler;
		const globalsHandler = assembler.globalsHandler();
		if (!globalsHandler) {
			return;
		}
		if ((globalsHandler as GlobalsTextureHandler).attribTextureData) {
			const globalsTextureHandler = globalsHandler as GlobalsTextureHandler;
			const positionTextureData = globalsTextureHandler.attribTextureData(this.pv.positionAttribName);
			const attribTextureData = globalsTextureHandler.attribTextureData(this.pv.attribName);
			if (positionTextureData && attribTextureData) {
				const {textureName, uvName} = positionTextureData;
				const attribTextureName = attribTextureData.textureName;
				const attribComponent = attribTextureData.component;
				const positionComponent = positionTextureData.component;
				const args = [
					textureName,
					uvName,
					position,
					// smooth
					attribTextureName,
					attribValue,
					maxDist,
					deltaThreshold,
					smoothAmount,
				].join(', ');

				const {functionName, functionDeclaration} = this._templateFunctionDefinition({
					positionComponent,
					attribComponent,
				});
				shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, functionDeclaration)]);

				bodyLines.push(`float ${out} = ${functionName}(${args})`);
			}
		}

		shadersCollectionController.addBodyLines(this, bodyLines);
	}

	private _templateFunctionDefinition(options: TemplateOptions) {
		const functionName = `${this.type()}${this.graphNodeId()}`;
		const functionDeclaration = ATTRIB_SMOOTH.replace('__FUNCTION__NAME__', functionName)
			.replace('__COMPONENT__', options.positionComponent)
			.replace('__COMPONENT_ATTRIB__', options.attribComponent);
		return {
			functionName,
			functionDeclaration,
		};
	}
}
