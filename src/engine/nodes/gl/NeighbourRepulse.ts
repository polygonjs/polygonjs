/**
 * NeighbourRepulse is used in particles systems to create flocking behaviours
 *
 *
 *
 */

import Repulse from './gl/neighbour/repulse.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {GlobalsTextureHandler} from './code/globals/Texture';

const OUTPUT_NAME = 'force';

class NeighbourRepulseGlParamsConfig extends NodeParamsConfig {
	positionAttribName = ParamConfig.STRING('position');
	position = ParamConfig.VECTOR3([0, 0, 0]);
	amount = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	minDist = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	maxDist = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new NeighbourRepulseGlParamsConfig();
export class NeighbourRepulseGlNode extends TypedGlNode<NeighbourRepulseGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'neighbourRepulse';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.outputs.setNamedOutputConnectionPoints([
			new GlConnectionPoint(OUTPUT_NAME, GlConnectionPointType.VEC3),
		]);
	}

	override setLines(shadersCollectionController: ShadersCollectionController) {
		const bodyLines: string[] = [];

		const position = ThreeToGl.vector3(this.variableForInputParam(this.p.position));
		const amount = ThreeToGl.float(this.variableForInputParam(this.p.amount));
		const minDist = ThreeToGl.float(this.variableForInputParam(this.p.minDist));
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
					// repulse
					amount,
					minDist,
					maxDist,
				].join(', ');

				const {functionName, functionDeclaration} = this._templateFunctionDefinition(component, uvName);
				shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, functionDeclaration)]);

				bodyLines.push(`vec3 ${out} = ${functionName}(${args})`);
			}
		}

		shadersCollectionController.addBodyLines(this, bodyLines);
	}

	private _templateFunctionDefinition(component: string, uvName: string) {
		const functionName = `${this.type()}${this.graphNodeId()}`;
		const functionDeclaration = Repulse.replace('__FUNCTION__NAME__', functionName).replace(
			'__COMPONENT__',
			component
		);
		return {
			functionName,
			functionDeclaration,
		};
	}
}
