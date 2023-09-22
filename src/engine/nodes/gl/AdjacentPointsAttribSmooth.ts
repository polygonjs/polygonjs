/**
 * smoothes an attribute between neighbouring points
 *
 *
 *
 */

import ADJACENT_POINTS_ATTRIB_SMOOTH from './gl/neighbour/adjacentPointsAttribSmooth.glsl';
import GET_UV from './gl/geometryAttributes/geometryAttributesLookupUv.glsl';
import {TypedGlNode} from './_Base';
import {ThreeToGl} from '../../../../src/core/ThreeToGl';
import {ParamConfig, NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {GlConnectionPointType, GlConnectionPoint} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {GlobalsTextureHandler, GlobalsTextureHandlerData} from './code/globals/Texture';
import {AttribAdjacency, adjacencyAttribName} from '../../../core/geometry/operation/Adjacency';
import {GlType} from '../../poly/registers/nodes/types/Gl';
import {UniformGLDefinition} from './utils/GLDefinition';
// import {ShaderAssemblerParticles} from './code/assemblers/particles/Particles';

const OUTPUT_NAME = 'attrib';
interface TemplateOptions {
	positionComponent: string;
	attribComponent: string;
	adjacencyTextureDatas: Array<GlobalsTextureHandlerData | undefined>;
}

class AdjacentPointsAttribSmoothGlParamsConfig extends NodeParamsConfig {
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
	textureSize = ParamConfig.VECTOR2([128, 128]);
	adjacencyCount = ParamConfig.FLOAT(6, {
		range: [0, 8],
		rangeLocked: [true, false],
	});
	adjacencyBaseName = ParamConfig.STRING(AttribAdjacency.BASE_NAME);
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
const ParamsConfig = new AdjacentPointsAttribSmoothGlParamsConfig();
export class AdjacentPointsAttribSmoothGlNode extends TypedGlNode<AdjacentPointsAttribSmoothGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.ADJACENT_POINTS_ATTRIB_SMOOTH;
	}
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.spare_params.setInputlessParamNames(['adjacencyCount', 'adjacencyBaseName']);
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
		const position = ThreeToGl.vector3(this.variableForInputParam(this.p.position));
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
			const positionTextureData: GlobalsTextureHandlerData | undefined = globalsTextureHandler.attribTextureData(
				this.pv.positionAttribName
			);
			const attribTextureData: GlobalsTextureHandlerData | undefined = globalsTextureHandler.attribTextureData(
				this.pv.attribName
			);
			const textureAllocationData = this.textureAllocationData();
			const adjacencyTextureDatas: Array<GlobalsTextureHandlerData | undefined> = textureAllocationData.map((d) =>
				globalsTextureHandler.attribTextureData(d)
			);
			if (
				positionTextureData &&
				attribTextureData &&
				adjacencyTextureDatas.length == textureAllocationData.length
			) {
				const {textureName, uvName} = positionTextureData;
				const attribTextureName = attribTextureData.textureName;
				const attribComponent = attribTextureData.component;
				const positionComponent = positionTextureData.component;
				const args: string[] = [
					textureName,
					uvName,
					position,
					textureSize,
					//
					attribTextureName,
					attribValue,
					deltaThreshold,
					smoothAmount,
				];

				const {functionName, functionDeclaration} = this._templateFunctionDefinition({
					positionComponent,
					attribComponent,
					adjacencyTextureDatas,
				});
				linesController.addDefinitions(this, [new FunctionGLDefinition(this, GET_UV)]);
				linesController.addDefinitions(this, [new FunctionGLDefinition(this, functionDeclaration)]);

				for (const textureData of adjacencyTextureDatas) {
					if (textureData) {
						linesController.addDefinitions(this, [
							new UniformGLDefinition(this, GlConnectionPointType.SAMPLER_2D, textureData.textureName),
						]);
						if (!args.includes(textureData.textureName)) {
							args.push(textureData.textureName);
						}
					}
				}

				bodyLines.push(`float ${out} = ${functionName}(${args.join(',\n')})`);
			}
		}

		linesController.addBodyLines(this, bodyLines);
	}

	textureAllocationData() {
		const count = this.pv.adjacencyCount;
		const attribNames: string[] = [];
		for (let i = 0; i < count; i++) {
			const attribName = adjacencyAttribName(this.pv.adjacencyBaseName, i);
			attribNames.push(attribName);
		}
		return attribNames;
	}

	private _templateFunctionDefinition(options: TemplateOptions) {
		const adjacencyCount = ThreeToGl.integer(this.pv.adjacencyCount);
		//
		// vec2 adjacencyAttributesArray[6] = vec2[6](adjacency0,adjacency1,adjacency2,adjacency3,adjacency4,adjacency5);
		const adjacencyVariableNames: string[] = [];
		const adjacencyTextureRead: string[] = [];
		const textureNames: string[] = [];
		let i = 0;
		for (const textureData of options.adjacencyTextureDatas) {
			if (textureData) {
				const {textureName, uvName, component} = textureData;
				const varName = adjacencyAttribName(this.pv.adjacencyBaseName, i);
				adjacencyVariableNames.push(varName);
				adjacencyTextureRead.push(`vec2 ${varName} = texture2D( ${textureName}, ${uvName} ).${component};`);
				if (!textureNames.includes(textureName)) {
					textureNames.push(textureName);
				}
			}
			i++;
		}
		const adjacencySamplersArguments: string = textureNames
			.map((textureName) => `sampler2D ${textureName}`)
			.join(`,\n`);
		const adjacencyArrayFromSamplers: string = `
${adjacencyTextureRead.join('\n')}
`;
		const adjacencyArrayValue: string = `[${adjacencyCount}] = vec2[${adjacencyCount}](
			${adjacencyVariableNames.join(',\n')}
					)`;

		//
		const functionName = `${this.type()}${this.graphNodeId()}`;
		const functionDeclaration = ADJACENT_POINTS_ATTRIB_SMOOTH.replace('__FUNCTION__NAME__', functionName)
			.replace('__COMPONENT__', options.positionComponent)
			.replace('__COMPONENT_ATTRIB__', options.attribComponent)
			.replace('__ADJACENCY_COUNT__', adjacencyCount)
			.replace('__ADJACENCY_VALUES_FROM_SAMPLERS__', adjacencyArrayFromSamplers)
			.replace('__ADJACENCY_ARRAY_VALUE__', adjacencyArrayValue)
			.replace('__ADJACENCY_SAMPLERS_ARGUMENTS__', adjacencySamplersArguments);
		return {
			functionName,
			functionDeclaration,
		};
	}
}
