/**
 * NeighbourDensity is used in particles systems to create flocking behaviours
 *
 *
 *
 */

import Density from './gl/neighbour/density.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {GlobalsTextureHandler} from './code/globals/Texture';

const OUTPUT_NAME = 'density';

class NeighbourDensityGlParamsConfig extends NodeParamsConfig {
	positionAttribName = ParamConfig.STRING('position');
	position = ParamConfig.VECTOR3([0, 0, 0]);
	maxDist = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new NeighbourDensityGlParamsConfig();
export class NeighbourDensityGlNode extends TypedGlNode<NeighbourDensityGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'neighbourDensity';
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
			const textureData = globalsTextureHandler.attribTextureData(this.pv.positionAttribName);
			if (textureData) {
				const {textureName, component, uvName} = textureData;
				const args = [
					textureName,
					uvName,
					position,
					// density
					maxDist,
				].join(', ');

				const {functionName, functionDeclaration} = this._templateFunctionDefinition(component);
				shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, functionDeclaration)]);

				bodyLines.push(`float ${out} = ${functionName}(${args})`);
			}
		}

		shadersCollectionController.addBodyLines(this, bodyLines);
	}

	private _templateFunctionDefinition(component: string) {
		const functionName = `${this.type()}${this.graphNodeId()}`;
		const functionDeclaration = Density.replace('__FUNCTION__NAME__', functionName).replace(
			'__COMPONENT__',
			component
		);
		return {
			functionName,
			functionDeclaration,
		};
	}
}
