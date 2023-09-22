import {
	BaseJsShaderAssembler,
	INSERT_DEFINE_AFTER,
	INSERT_BODY_AFTER,
	INSERT_MEMBERS_AFTER,
	INSERT_CONSTRUCTOR_AFTER,
	SpareParamOptions,
} from '../_Base';
import {RegisterableVariable} from '../_BaseJsPersistedConfigUtils';
import {JsFunctionName} from '../../../../utils/shaders/ShaderName';
import {JsLinesCollectionController} from '../../utils/JsLinesCollectionController';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {ParamOptions} from '../../../../../params/utils/OptionsController';
import {AttributeJsNodeInput} from '../../../Attribute';
import {NodeContext} from '../../../../../poly/NodeContext';
import {JsType} from '../../../../../poly/registers/nodes/types/Js';
import {PointBuilderFunctionData, PointBuilderFunctionDataAttributeDataItem} from './_BasePointBuilderPersistedConfig';
import {PrettierController} from '../../../../../../core/code/PrettierController';
import {PointBuilderAssemblerConstant} from './PointBuilderAssemblerCommon';
import type {AttributeJsNode} from '../../../Attribute';

const TEMPLATE = `
${INSERT_DEFINE_AFTER}
${INSERT_MEMBERS_AFTER}
${INSERT_CONSTRUCTOR_AFTER}
const __EVALUATOR_NAME___ = function(){
	${INSERT_BODY_AFTER}
`;
const CLOSE_CLASS_DEFINITION = `};
return __EVALUATOR_NAME___;`;

export class JsAssemblerBasePointBuilder extends BaseJsShaderAssembler {
	makeFunctionNodeDirtyOnChange() {
		return true;
	}
	override templateShader() {
		return {
			main: TEMPLATE.replace(/__EVALUATOR_NAME___/g, this._evaluatorName()),
		};
	}
	protected _closeClassDefinition() {
		return CLOSE_CLASS_DEFINITION.replace(/__EVALUATOR_NAME___/g, this._evaluatorName());
	}
	protected _evaluatorName(): string {
		return 'BasePointBuilderEvaluator';
	}

	override spareParamsOptions(options: SpareParamOptions) {
		const _options: ParamOptions = {
			spare: true,
			// computeOnDirty: true, // not needed if cook option is not set
			// cook: false, // for SDFBuilder, the node needs to recook
			// important for texture nodes
			// that compute after being found by the nodepath param
			dependentOnFoundNode: true,
		};
		return _options;
	}
	defaultObject3DVariable(): string {
		return PointBuilderAssemblerConstant.OBJECT_3D;
	}
	defaultObject3DMaterialVariable(): string {
		return PointBuilderAssemblerConstant.MATERIAL;
	}
	defaultPointIndexVariable(): string {
		return PointBuilderAssemblerConstant.PTNUM;
	}

	functionData(): PointBuilderFunctionData | undefined {
		// const functionBody = this._shaders_by_name.get(ShaderName.FRAGMENT);
		const _buildFunctionBody = () => {
			const bodyLines = this._shaders_by_name.get(JsFunctionName.MAIN) || TEMPLATE;
			const functionBodyElements = [
				bodyLines,
				// triggerableFunctionLines.join('\n'),
				// triggerFunctionLines.join('\n'),
				this._closeClassDefinition(),
			];
			const functionBody = PrettierController.formatJs(functionBodyElements.join('\n'));
			return functionBody;
		};
		const functionBody = _buildFunctionBody();
		if (!functionBody) {
			return;
		}
		const variableNames: string[] = [];
		const functionNames: Array<keyof NamedFunctionMap> = [];
		const variablesByName: Record<string, RegisterableVariable> = {};
		const functionsByName: Record<string, Function> = {};
		this.traverseRegisteredVariables((variable, varName) => {
			variableNames.push(varName);
			variablesByName[varName] = variable;
		});
		this.traverseRegisteredFunctions((namedFunction) => {
			functionNames.push(namedFunction.type() as keyof NamedFunctionMap);
			functionsByName[namedFunction.type()] = namedFunction.func.bind(namedFunction);
		});

		// gather attribute data
		const attribNodes: AttributeJsNode[] = [];
		this.currentJsParentNode().childrenController?.traverseChildren((child) => {
			if (child.context() == NodeContext.JS && child.type() == JsType.ATTRIBUTE) {
				attribNodes.push(child as AttributeJsNode);
			}
		});
		const attributesRead: PointBuilderFunctionDataAttributeDataItem[] = attribNodes
			.filter((n) => n.isImporting())
			.map((attribNode) => attribNode.attribData());
		const attributesWrite: PointBuilderFunctionDataAttributeDataItem[] = attribNodes
			.filter((n) => n.isExporting())
			.map((attribNode) => attribNode.attribData());

		// const paramConfigs = this.param_configs();
		const paramConfigs = this.param_configs();
		return {
			functionBody,
			variableNames,
			variablesByName,
			functionNames,
			functionsByName,
			paramConfigs: [...paramConfigs],
			attributesData: {
				read: attributesRead,
				write: attributesWrite,
			},
		};
	}

	override updateFunction() {
		super.updateFunction();
		this._lines = new Map();
		this._shaders_by_name = new Map();
		const shaderNames = this.shaderNames();

		if (this._root_nodes.length > 0) {
			this.buildCodeFromNodes(this._root_nodes);
			this._buildLines();
		}

		for (const shaderName of shaderNames) {
			const lines = this._lines.get(shaderName);
			if (lines) {
				this._shaders_by_name.set(shaderName, lines.join('\n'));
			}
		}
	}

	override setNodeLinesAttribute(attributeNode: AttributeJsNode, linesController: JsLinesCollectionController) {
		const shaderName = linesController.currentShaderName();
		const shaderConfig = this.shader_config(shaderName);
		if (!shaderConfig) {
			return;
		}
		const bodyLines: string[] = [];
		const attribName = attributeNode.attributeName();
		// const dataType = attributeNode.jsType();

		// export
		if (attributeNode.isExporting()) {
			const exportedValue = attributeNode.variableForInput(linesController, AttributeJsNodeInput.EXPORT);
			const bodyLine = `${PointBuilderAssemblerConstant.ATTRIBUTES_DICT}.set('${attribName}', ${exportedValue})`;
			bodyLines.push(bodyLine);
		}

		// output
		const usedOutputNames = attributeNode.io.outputs.used_output_names();

		for (const outputName of usedOutputNames) {
			const varName = attributeNode.jsVarName(outputName);

			const bodyLine = `${varName} = ${PointBuilderAssemblerConstant.ATTRIBUTES_DICT}.get('${attribName}')`;
			bodyLines.push(bodyLine);
		}
		linesController._addBodyLines(attributeNode, bodyLines);
	}
}
