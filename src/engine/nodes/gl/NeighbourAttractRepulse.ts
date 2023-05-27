/**
 * NeighbourAttractRepulse is used in particles systems to create flocking behaviours
 *
 *
 *
 */

import AttractRepulse from './gl/neighbour/attractRepulse.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {ParamOptions} from '../../params/utils/OptionsController';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {GlobalsTextureHandler} from './code/globals/Texture';

const OUTPUT_NAME = 'force';

const visibleIfRepulse: ParamOptions = {
	visibleIf: {repulse: true},
};
const visibleIfAttract: ParamOptions = {
	visibleIf: {attract: true},
};
class NeighbourAttractRepulseParamsConfig extends NodeParamsConfig {
	positionAttribName = ParamConfig.STRING('position');
	position = ParamConfig.VECTOR3([0, 0, 0]);
	repulse = ParamConfig.BOOLEAN(1, {
		separatorBefore: true,
	});
	repulseAmount = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...visibleIfRepulse,
	});
	repulseMinDist = ParamConfig.FLOAT(1, {
		range: [0, 10],
		rangeLocked: [true, false],
		...visibleIfRepulse,
	});
	repulseMaxDist = ParamConfig.FLOAT(2, {
		range: [0, 10],
		rangeLocked: [true, false],
		...visibleIfRepulse,
	});
	attract = ParamConfig.BOOLEAN(1, {
		separatorBefore: true,
	});
	attractAmount = ParamConfig.FLOAT(1, {
		range: [0, 1],
		rangeLocked: [true, false],
		...visibleIfAttract,
	});
	attractStartDist = ParamConfig.FLOAT(3, {
		range: [0, 10],
		rangeLocked: [true, false],
		...visibleIfAttract,
	});
	attractMidDist = ParamConfig.FLOAT(4, {
		range: [0, 10],
		rangeLocked: [true, false],
		...visibleIfAttract,
	});
	attractEndDist = ParamConfig.FLOAT(5, {
		range: [0, 10],
		rangeLocked: [true, false],
		...visibleIfAttract,
	});
}
const ParamsConfig = new NeighbourAttractRepulseParamsConfig();
export class NeighbourAttractRepulseGlNode extends TypedGlNode<NeighbourAttractRepulseParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'neighbourAttractRepulse';
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
		const repulse = ThreeToGl.bool(this.variableForInputParam(this.p.repulse));
		const repulseAmount = ThreeToGl.float(this.variableForInputParam(this.p.repulseAmount));
		const repulseMinDist = ThreeToGl.float(this.variableForInputParam(this.p.repulseMinDist));
		const repulseMaxDist = ThreeToGl.float(this.variableForInputParam(this.p.repulseMaxDist));
		const attract = ThreeToGl.float(this.variableForInputParam(this.p.attract));
		const attractAmount = ThreeToGl.float(this.variableForInputParam(this.p.attractAmount));
		const attractStartDist = ThreeToGl.float(this.variableForInputParam(this.p.attractStartDist));
		const attractMidDist = ThreeToGl.float(this.variableForInputParam(this.p.attractMidDist));
		const attractEndDist = ThreeToGl.float(this.variableForInputParam(this.p.attractEndDist));

		// TODO:
		// - work out better math so that repulse/attract functions
		// - link position and vel textures in the function (vel may not yet be needed)
		// - how could I just have repulse?
		// - ensure that in the for loop the number of particles is known so that we don't look up non existing ones
		// - this node should probably be only available in particles
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
					repulse,
					repulseAmount,
					repulseMinDist,
					repulseMaxDist,
					// attract
					attract,
					attractAmount,
					attractStartDist,
					attractMidDist,
					attractEndDist,
				].join(', ');

				const {functionName, functionDeclaration} = this._templateFlocking(component, );
				shadersCollectionController.addDefinitions(this, [new FunctionGLDefinition(this, functionDeclaration)]);

				bodyLines.push(`vec3 ${out} = ${functionName}(${args})`);
			}
		}

		shadersCollectionController.addBodyLines(this, bodyLines);
	}

	private _templateFlocking(component: string) {
		const functionName = `flocking${this.graphNodeId()}`;
		const functionDeclaration = AttractRepulse.replace('__FUNCTION__NAME__', functionName).replace(
			'__COMPONENT__',
			component
		);
		return {
			functionName,
			functionDeclaration,
		};
	}
}
