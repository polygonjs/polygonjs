/**
 * NeighbourAttract is used in particles systems to create flocking behaviours
 *
 *
 *
 */

import Attract from './gl/neighbour/attract.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {GlobalsTextureHandler} from './code/globals/Texture';

const OUTPUT_NAME = 'force';

class NeighbourAttractGlParamsConfig extends NodeParamsConfig {
	positionAttribName = ParamConfig.STRING('position');
	position = ParamConfig.VECTOR3([0, 0, 0]);
	amount = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	startDist = ParamConfig.FLOAT(3, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	midDist = ParamConfig.FLOAT(4, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	endDist = ParamConfig.FLOAT(5, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new NeighbourAttractGlParamsConfig();
export class NeighbourAttractGlNode extends TypedGlNode<NeighbourAttractGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'neighbourAttract';
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
		const startDist = ThreeToGl.float(this.variableForInputParam(this.p.startDist));
		const midDist = ThreeToGl.float(this.variableForInputParam(this.p.midDist));
		const endDist = ThreeToGl.float(this.variableForInputParam(this.p.endDist));

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
					// attract
					amount,
					startDist,
					midDist,
					endDist,
				].join(', ');

				const {functionName, functionDeclaration} = this._templateFunctionDefinition(component);
				shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, functionDeclaration)]);

				bodyLines.push(`vec3 ${out} = ${functionName}(${args})`);
			}
		}

		shadersCollectionController.addBodyLines(this, bodyLines);
	}

	private _templateFunctionDefinition(component: string) {
		const functionName = `${this.type()}${this.graphNodeId()}`;
		const functionDeclaration = Attract.replace('__FUNCTION__NAME__', functionName).replace(
			'__COMPONENT__',
			component
		);
		return {
			functionName,
			functionDeclaration,
		};
	}
}
