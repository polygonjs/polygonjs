/**
 * computes normals after applying transformations on the current vertex as well as the adjacent ones.
 *
 *
 *
 */

import {TypedSubnetGlNode, TypedSubnetGlParamsConfigMixin, ADD_BODY_LINES_OPTIONS} from './Subnet';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {SubnetInputGlNode} from './SubnetInput';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {AttribAdjacency, adjacencyAttribName} from '../../../core/geometry/operation/Adjacency';
import {BaseGlShaderAssembler} from './code/assemblers/_Base';
import {TypeAssert} from '../../poly/Assert';
import GET_UV from './gl/geometryAttributes/geometryAttributesLookupUv.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {AttribLookup} from '../../../core/geometry/operation/TextureFromAttribute';
import {GlType} from '../../poly/registers/nodes/types/Gl';
// import {SubnetOutputGlNode} from './SubnetOutput';

export enum ComputeNormalsInput {
	P = 'P',
	N = 'N',
	TEXTURE_SIZE = 'textureSize',
	UV = 'adjacencyUv',
	ID = 'adjacencyId',
}
enum ForLoopVar {
	ADJACENCY_ATTRIBUTES_ARRAY = 'adjacencyAttributesArray',
	FACE_INDEX = 'faceIndex',
	VERTEX_INDEX = 'vertexIndex',
	CURRENT_ADJACENT_ID_FOR_FACE = 'currentAdjacentIdForFace',
	CURRENT_ADJACENT_ID = 'currentAdjacentId',
	ADJACENT_POS0 = 'adjacentPos0',
	ADJACENT_POS1 = 'adjacentPos1',
	COMPUTED_NORMAL = 'computedNormal',
}
const CONSTANT = {
	START: 0,
	STEP: 1,
};
const SUBNET_INPUT_CONNECTIONS_OFFSET = 3;
const CURRENT_POINT_GL_VAR_NAME_SUFFIX = 'currentPoint';

enum VariablesLookupMode {
	CURRENT_POINT = 'currentPoint',
	ADJACENT_POINT = 'adjacentPoint',
}

class ComputeNormalsGlParamsConfig extends TypedSubnetGlParamsConfigMixin(NodeParamsConfig) {
	adjacencyCount = ParamConfig.FLOAT(6, {
		range: [0, 8],
		rangeLocked: [true, false],
	});
	adjacencyBaseName = ParamConfig.STRING(AttribAdjacency.BASE_NAME);
}
const ParamsConfig = new ComputeNormalsGlParamsConfig();

export class ComputeNormalsGlNode extends TypedSubnetGlNode<ComputeNormalsGlParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return GlType.COMPUTE_NORMALS;
	}

	protected override _expectedOutputTypes(): GlConnectionPointType[] {
		return [
			GlConnectionPointType.VEC3,
			GlConnectionPointType.VEC3,
			GlConnectionPointType.VEC2,
			...super._expectedOutputTypes(),
		];
	}

	protected override _expectedInputTypes(): GlConnectionPointType[] {
		return [
			GlConnectionPointType.VEC3,
			GlConnectionPointType.VEC3,
			GlConnectionPointType.VEC2,
			...super._expectedInputTypes(),
		];
	}
	protected override _expectedOutputName(index: number) {
		return this._expectedInputName(index);
	}

	protected override _expectedInputName(index: number) {
		return (
			[ComputeNormalsInput.P, ComputeNormalsInput.N, ComputeNormalsInput.TEXTURE_SIZE][index] ||
			super._expectedInputName(index - 3)
		);
	}
	override childExpectedInputConnectionPointTypes() {
		return [
			// GlConnectionPointType.VEC3,
			// GlConnectionPointType.VEC3,
			GlConnectionPointType.VEC2,
			GlConnectionPointType.INT,
			...super._expectedInputTypes(),
		];
	}
	override childExpectedInputConnectionPointName(index: number) {
		return (
			[
				// ComputeNormalsInput.P,
				// ComputeNormalsInput.N,
				ComputeNormalsInput.UV,
				ComputeNormalsInput.ID,
			][index] || super._expectedInputName(index - 2)
		);
	}
	override childExpectedOutputConnectionPointTypes() {
		return [GlConnectionPointType.VEC3, ...super._expectedInputTypes()];
	}
	override childExpectedOutputConnectionPointName(index: number) {
		switch (index) {
			case 0: {
				return ComputeNormalsInput.P;
			}
			default: {
				// no normals for output, since the point of this node is to calculate them
				return super._expectedInputName(index - 1);
			}
		}
	}

	//
	//
	// set_lines
	//
	//
	// _varNameSuffix: string | undefined;
	_variableLookupMode: VariablesLookupMode = VariablesLookupMode.CURRENT_POINT;
	protected override _glVarNameBase() {
		const varName = super._glVarNameBase();
		switch (this._variableLookupMode) {
			case VariablesLookupMode.CURRENT_POINT: {
				return `${varName}_${CURRENT_POINT_GL_VAR_NAME_SUFFIX}`;
			}
			case VariablesLookupMode.ADJACENT_POINT: {
				return varName;
			}
		}
	}
	private _withCurrentPoint(callback: () => void) {
		this._variableLookupMode = VariablesLookupMode.CURRENT_POINT;
		const result = callback();
		this._variableLookupMode = VariablesLookupMode.ADJACENT_POINT;
		return result;
	}

	private _adjacencyLookupId() {
		switch (this._variableLookupMode) {
			case VariablesLookupMode.CURRENT_POINT: {
				return AttribLookup.ID;
			}
			case VariablesLookupMode.ADJACENT_POINT: {
				return this.glVarName(ForLoopVar.CURRENT_ADJACENT_ID);
			}
		}
		TypeAssert.unreachable(this._variableLookupMode);
	}
	private _adjacencyLookupUv() {
		switch (this._variableLookupMode) {
			case VariablesLookupMode.CURRENT_POINT: {
				return AttribLookup.UV;
			}
			case VariablesLookupMode.ADJACENT_POINT: {
				const id = this._adjacencyLookupId();
				const textureSize = ThreeToGl.vector2(this.variableForInput(ComputeNormalsInput.TEXTURE_SIZE));
				// const textureSize = ThreeToGl.float(this.pv.textureSize);
				return `geometryAttributesLookupUv(float(${id}), ${textureSize})`;
			}
		}
		TypeAssert.unreachable(this._variableLookupMode);
	}
	protected override setLinesBlockStart(linesController: ShadersCollectionController) {
		const start: number = CONSTANT.START;
		const step: number = CONSTANT.STEP;
		const glType = GlConnectionPointType.INT;
		const convertMethod = ThreeToGl.integer;
		const startStr = convertMethod(start);
		const stepStr = convertMethod(step);

		const bodyLines: string[] = [];
		const varNameAttributesArray = this.glVarName(ForLoopVar.ADJACENCY_ATTRIBUTES_ARRAY);
		const faceIndexIteratorName = this.glVarName(ForLoopVar.FACE_INDEX);
		const vertexIndexIteratorName = this.glVarName(ForLoopVar.VERTEX_INDEX);
		const varNameCurrentAdjacentIdForFace = this.glVarName(ForLoopVar.CURRENT_ADJACENT_ID_FOR_FACE);
		const varNameP = this.glVarName(ComputeNormalsInput.P);
		const varNameN = this.glVarName(ComputeNormalsInput.N);
		const varNamesForInputs: Record<string, string> = {};
		const traverseInputs = (
			callback: (inputType: GlConnectionPointType, inputName: string, varName: string) => void
		) => {
			const inputTypes = this._expectedInputTypes();
			const inputsCount = inputTypes.length;
			for (let i = 2; i < inputsCount; i++) {
				const inputName = this._expectedInputName(i);
				const inputType = inputTypes[i];
				const varName = this.glVarName(inputName);
				callback(inputType, inputName, varName);
			}
		};
		traverseInputs((inputType, inputName, varName) => {
			varNamesForInputs[inputName] = varName;
		});

		// const varNameUv = this.glVarName(ComputeNormalsInput.UV);
		// const varNameId = this.glVarName(ComputeNormalsInput.ID);
		this._withCurrentPoint(() => {
			const linesForCurrentPoint = this.linesBlockContent(linesController);
			if (linesForCurrentPoint) {
				// bodyLines.push(`${GlConnectionPointType.INT} ${this.glVarName(ForLoopVar.FACE_INDEX)} = 0;`);
				bodyLines.push(`${GlConnectionPointType.VEC3} ${this.glVarName(ComputeNormalsInput.P)} = ${varNameP};`);
				bodyLines.push(`${GlConnectionPointType.VEC3} ${this.glVarName(ComputeNormalsInput.N)} = ${varNameN};`);
				bodyLines.push(
					`${GlConnectionPointType.VEC2} ${this.glVarName(ComputeNormalsInput.UV)} = ${AttribLookup.UV};`
				);
				bodyLines.push(
					`${GlConnectionPointType.INT} ${this.glVarName(ComputeNormalsInput.ID)} = ${AttribLookup.ID};`
				);
				traverseInputs((inputType, inputName, varName) => {
					bodyLines.push(`${inputType} ${this.glVarName(inputName)} = ${varNamesForInputs[inputName]};`);
				});

				bodyLines.push(...linesForCurrentPoint);
			}
		});
		const _initAdjacentPos = () => {
			const adjacentPos0 = this.glVarName(ForLoopVar.ADJACENT_POS0);
			const adjacentPos1 = this.glVarName(ForLoopVar.ADJACENT_POS1);
			const glType = GlConnectionPointType.VEC3;
			return [`${glType} ${adjacentPos0}`, `${glType} ${adjacentPos1}`];
		};
		const _initComputedNormal = () => {
			const computedNormal = this.glVarName(ForLoopVar.COMPUTED_NORMAL);
			const glType = GlConnectionPointType.VEC3;
			// make sure it is initialized to a value,
			// in case the current point has no valid adjacent points
			return [`${glType} ${computedNormal} = vec3(0.)`];
		};
		const _getAdjacencyAttributeArray = () => {
			const adjacencyCount: number = this.pv.adjacencyCount;
			const adjacencyBaseName: string = this.pv.adjacencyBaseName;
			const adjacencyAttributeNames: string[] = [];
			for (let i = 0; i < adjacencyCount; i++) {
				const attribName = adjacencyAttribName(adjacencyBaseName, i);
				adjacencyAttributeNames.push(attribName);
			}
			const glType = GlConnectionPointType.VEC2;
			return `${glType} ${varNameAttributesArray}[${adjacencyCount}] = vec2[${adjacencyCount}](${adjacencyAttributeNames.join(
				','
			)})`;
		};
		const _forLoopFaces = () => {
			const max: number = this.pv.adjacencyCount;
			const maxStr = convertMethod(max);

			const bodyLine = `for(${glType} ${faceIndexIteratorName} = ${startStr}; ${faceIndexIteratorName} < ${maxStr}; ${faceIndexIteratorName}+= ${stepStr}){`;
			return bodyLine;
		};
		const _getAdjacencyAttributeForFace = () => {
			const glType = GlConnectionPointType.VEC2;
			return `${glType} ${varNameCurrentAdjacentIdForFace} = ${varNameAttributesArray}[${faceIndexIteratorName}]`;
		};
		const _forLoopVertices = () => {
			const max: number = 2;
			const maxStr = convertMethod(max);
			const bodyLine = `for(${glType} ${vertexIndexIteratorName} = ${startStr}; ${vertexIndexIteratorName} < ${maxStr}; ${vertexIndexIteratorName}+= ${stepStr}){`;
			return bodyLine;
		};
		const _getAdjacencyAttribute = () => {
			const glType = GlConnectionPointType.INT;
			const varName = this.glVarName(ForLoopVar.CURRENT_ADJACENT_ID);
			return `${glType} ${varName} = ${vertexIndexIteratorName}==0 ? int(${varNameCurrentAdjacentIdForFace}.x) : int(${varNameCurrentAdjacentIdForFace}.y)`;
		};
		const _ifAdjacencyIdValid = () => {
			return `if(${varNameCurrentAdjacentIdForFace}.x > -0.5 && ${varNameCurrentAdjacentIdForFace}.y >= -0.5){`;
		};
		bodyLines.push(..._initAdjacentPos());
		bodyLines.push(..._initComputedNormal());
		bodyLines.push(_getAdjacencyAttributeArray());
		bodyLines.push(_forLoopFaces());
		bodyLines.push(_getAdjacencyAttributeForFace());
		bodyLines.push(_ifAdjacencyIdValid());
		bodyLines.push(_forLoopVertices());
		bodyLines.push(_getAdjacencyAttribute());

		linesController.addBodyLines(this, bodyLines, undefined, ADD_BODY_LINES_OPTIONS);
		linesController.addDefinitions(this, [new FunctionGLDefinition(this, GET_UV)]);
	}
	protected override setLinesBlockEnd(shadersCollectionController: ShadersCollectionController) {
		const vertexIndexIteratorName = this.glVarName(ForLoopVar.VERTEX_INDEX);
		const adjacentPos0 = this.glVarName(ForLoopVar.ADJACENT_POS0);
		const adjacentPos1 = this.glVarName(ForLoopVar.ADJACENT_POS1);
		const currentPos = this.glVarName(ComputeNormalsInput.P);
		const computedNormal = this.glVarName(ForLoopVar.COMPUTED_NORMAL);
		const varNameP = this._withCurrentPoint(() => this.glVarName(ComputeNormalsInput.P));

		const assignAdjacentPos = `if( ${vertexIndexIteratorName} == 0 ){ ${adjacentPos0}=${currentPos}; } else { ${adjacentPos1}=${currentPos}; }`;
		const closeIf = `}`;
		const closeFacePair = `}`;
		const addFaceNormal = `${computedNormal} += cross( normalize(${adjacentPos0} - ${varNameP}), normalize(${adjacentPos1} - ${varNameP}) );`;
		const closeAdjacencies = `}`;
		const useCurrentP = `${this.glVarName(ComputeNormalsInput.P)} = ${varNameP}`;
		const useComputedN = `${this.glVarName(ComputeNormalsInput.N)} = normalize(${computedNormal})`;

		shadersCollectionController.addBodyLines(this, [
			assignAdjacentPos,
			closeIf,
			closeFacePair,
			addFaceNormal,
			closeAdjacencies,
			useCurrentP,
			useComputedN,
		]);
	}
	override setSubnetInputLines(linesController: ShadersCollectionController, childNode: SubnetInputGlNode) {
		// const glType = GlConnectionPointType.INT
		// const convertMethod = ThreeToGl.integer
		const bodyLines: string[] = [];

		// declare adjacency attributes
		const assembler = linesController.assembler() as BaseGlShaderAssembler;
		const _declareAdjacency = () => {
			const adjacencyCount: number = this.pv.adjacencyCount;
			const adjacencyBaseName: string = this.pv.adjacencyBaseName;
			for (let i = 0; i < adjacencyCount; i++) {
				const glType = GlConnectionPointType.VEC2;
				const attribName = adjacencyAttribName(adjacencyBaseName, i);
				/*const newVar =*/ assembler.globalsHandler()?.readAttribute(this, glType, attribName, linesController);
				// const varName = this.glVarName(attribName);
				// bodyLines.push(`${glType} ${varName} = ${newVar}`);
			}
		};
		const _declareUv = () => {
			const glType = GlConnectionPointType.VEC2;
			const attribName = AttribLookup.UV;
			/*const newVar =*/ assembler.globalsHandler()?.readAttribute(this, glType, attribName, linesController);
			// const varName = this.glVarName(attribName);
			// bodyLines.push(`${glType} ${varName} = ${newVar}`);
		};
		const _declareId = () => {
			const glType = GlConnectionPointType.INT;
			const attribName = AttribLookup.ID;
			/*const newVar =*/ assembler.globalsHandler()?.readAttribute(this, glType, attribName, linesController);
			// const varName = this.glVarName(attribName);
			// bodyLines.push(`${glType} ${varName} = ${newVar}`);
		};
		_declareAdjacency();
		_declareUv();
		_declareId();

		//

		// i
		// const _addFaceIndex = () => {
		// 	const iteratorName = this.glVarName(ForLoopVar.FACE_INDEX);
		// 	const i = childNode.glVarName(ForLoopVar.FACE_INDEX);
		// 	bodyLines.push(`	${GlConnectionPointType.INT} ${i} = ${iteratorName}`);
		// };
		const _addAdjacencyLookupId = () => {
			const adjacencyLookupId = this._adjacencyLookupId();
			const id = childNode.glVarName(ComputeNormalsInput.ID);
			bodyLines.push(`	${GlConnectionPointType.INT} ${id} = ${adjacencyLookupId}`);
		};
		const _addAdjacencyLookupUv = () => {
			const adjacencyLookupUv = this._adjacencyLookupUv(); //this.glVarName(ComputeNormalsInput.UV);
			const uv = childNode.glVarName(ComputeNormalsInput.UV);
			bodyLines.push(`	${GlConnectionPointType.VEC2} ${uv} = ${adjacencyLookupUv}`);
		};
		// _addFaceIndex();
		_addAdjacencyLookupId();
		_addAdjacencyLookupUv();
		// start
		// const start = childNode.glVarName(ComputeNormalsInput.START);
		// body_lines.push(`	${glType} ${start} = ${convertMethod( CONSTANT.START)}`);
		// end
		// const max = childNode.glVarName(ComputeNormalsInput.MAX);
		// body_lines.push(`	${glType} ${max} = ${convertMethod(this.pv.max)}`);
		// step
		// const step = childNode.glVarName(ComputeNormalsInput.STEP);
		// body_lines.push(`	${glType} ${step} = ${convertMethod(this.pv.step)}`);

		const connections = this.io.connections.inputConnections();
		if (connections) {
			for (const connection of connections) {
				if (connection) {
					if (connection.inputIndex() >= SUBNET_INPUT_CONNECTIONS_OFFSET) {
						const connection_point = connection.destConnectionPoint();
						const in_value = this.glVarName(connection_point.name());
						const gl_type = connection_point.type();
						const out = childNode.glVarName(connection_point.name());
						const body_line = `	${gl_type} ${out} = ${in_value}`;
						bodyLines.push(body_line);
					}
				}
			}
		}

		linesController.addBodyLines(childNode, bodyLines);
	}
	// override subnetOutputLines(childNode: SubnetOutputGlNode) {
	// 	const bodyLines: string[] = super.subnetOutputLines(childNode);

	// 	const varNameP = this._withCurrentPoint(() => this.glVarName(ComputeNormalsInput.P));
	// 	bodyLines.push(`	${this.glVarName(ComputeNormalsInput.P)} = ${varNameP}`);

	// 	return bodyLines;
	// }
}
