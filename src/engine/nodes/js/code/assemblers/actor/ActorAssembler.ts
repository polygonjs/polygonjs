import {
	BaseJsShaderAssembler,
	INSERT_DEFINE_AFTER,
	INSERT_CONSTRUCTOR_AFTER,
	INSERT_BODY_AFTER,
	INSERT_MEMBERS_AFTER,
	SpareParamOptions,
} from '../_Base';
import {RegisterableVariable} from '../_BaseJsPersistedConfigUtils';
import {JsFunctionName} from '../../../../utils/shaders/ShaderName';
import {connectedTriggerableNodes, findTriggeringNodes, inputNodesExceptTrigger} from './ActorAssemblerUtils';
import {BaseJsNodeType} from '../../../_Base';
import {SetUtils} from '../../../../../../core/SetUtils';
import {PrettierController} from '../../../../../../core/code/PrettierController';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {ActorFunctionData} from './ActorPersistedConfig';
import {EvaluatorEventData} from './ActorEvaluator';
import {ActorAssemblerConstant} from './ActorAssemblerCommon';
import {CoreType} from '../../../../../../core/Type';
import {ParamOptions} from '../../../../../params/utils/OptionsController';
import {JsConnectionPointType} from '../../../../utils/io/connections/Js';
import {ActorBuilderNode} from '../../../../../scene/utils/ActorsManager';
import {logBlue as _logBlue} from '../../../../../../core/logger/Console';
import {ParamType} from '../../../../../poly/ParamType';
import {JsShaderConfig} from '../../configs/ShaderConfig';

const TEMPLATE = `
${INSERT_DEFINE_AFTER}
class CustomActorEvaluator extends ActorEvaluator {
	${INSERT_MEMBERS_AFTER}
	constructor(node, object3D){
		super(node, object3D);
		${INSERT_CONSTRUCTOR_AFTER}
	}
	${INSERT_BODY_AFTER}
`;
const CLOSE_CLASS_DEFINITION = `};
return CustomActorEvaluator;`;

export class JsAssemblerActor extends BaseJsShaderAssembler {
	makeFunctionNodeDirtyOnChange() {
		return false;
	}
	override templateShader() {
		return {
			main: TEMPLATE,
		};
	}
	override inputNamesForShaderName(rootNode: BaseJsNodeType, shaderName: JsFunctionName) {
		return rootNode.io.inputs
			.namedInputConnectionPoints()
			.filter((cp) => cp.type() != JsConnectionPointType.TRIGGER)
			.map((cp) => cp.name());
	}
	override computedVariablesAllowed(): boolean {
		return true;
	}
	override spareParamsOptions(options: SpareParamOptions) {
		const {type} = options;
		const _options: ParamOptions = {
			spare: true,
			computeOnDirty: type != ParamType.PARAM_PATH,
			cook: false,
			// dependentOnFoundNode: true,
			// there is no point in setting the callback option here,
			// as it would then not be present when reloading the scene
			// callback: (node, param) => {
			// 	touchParamRef(node, param.name());
			// },
		};
		return _options;
	}
	defaultObject3DVariable(): string {
		return ActorAssemblerConstant.OBJECT_3D;
	}
	defaultObject3DMaterialVariable(): string {
		return ActorAssemblerConstant.MATERIAL;
	}
	defaultPointIndexVariable(): string {
		return ActorAssemblerConstant.PTNUM;
	}

	createFunctionData(additionalRootNodes: BaseJsNodeType[]): ActorFunctionData | undefined {
		const node = this.currentJsParentNode() as ActorBuilderNode;
		this._reset();
		//
		const triggeringNodes = findTriggeringNodes(node);
		const triggerableNodes = new Set<BaseJsNodeType>();
		connectedTriggerableNodes({triggeringNodes, triggerableNodes, recursive: true});

		const shaderNames = this.shaderNames();

		const functionData = this._createFunctionData(
			additionalRootNodes,
			triggeringNodes,
			triggerableNodes,
			shaderNames
		);

		return functionData;
	}
	private _createFunctionData(
		additionalRootNodes: BaseJsNodeType[],
		triggeringNodes: Set<BaseJsNodeType>,
		triggerableNodes: Set<BaseJsNodeType>,
		shaderNames: JsFunctionName[]
	): ActorFunctionData | undefined {
		const functionNode = this.currentJsParentNode() as ActorBuilderNode;

		//
		//
		// create computed props
		//
		//
		const _addComputedProps = () => {
			const rootNodesSet: Set<BaseJsNodeType> = new Set();
			triggerableNodes.forEach((trigerrableNode) => {
				const rootNodes = inputNodesExceptTrigger(trigerrableNode);
				for (let rootNode of rootNodes) {
					rootNodesSet.add(rootNode);
				}
			});
			const rootNodes = SetUtils.toArray(rootNodesSet).concat(additionalRootNodes);
			this.set_root_nodes(rootNodes);
			this.buildCodeFromNodes(this._root_nodes, {
				actor: {
					functionNode,
					triggeringNodes: triggeringNodes,
					triggerableNodes: triggerableNodes,
				},
			});

			this._buildLines();
			for (let shaderName of shaderNames) {
				const lines = this._lines.get(shaderName);
				if (lines) {
					this._shaders_by_name.set(shaderName, lines.join('\n'));
				}
			}
		};
		_addComputedProps();

		//
		//
		// ASSEMBLE FUNCTION BODY
		//
		//
		const _buildFunctionBody = () => {
			const bodyLines = this._shaders_by_name.get(JsFunctionName.MAIN) || TEMPLATE;
			const functionBodyElements = [bodyLines, CLOSE_CLASS_DEFINITION];
			const functionBody = PrettierController.formatJs(functionBodyElements.join('\n'));
			return functionBody;
		};
		const functionBody = _buildFunctionBody();
		//
		//
		// gather function data
		//
		//
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
		const paramConfigs = this.param_configs();

		//
		//
		// create evaluator
		//
		//

		const variables: RegisterableVariable[] = [];
		const functions: Function[] = [];
		for (const variableName of variableNames) {
			const variable = variablesByName[variableName];
			variables.push(variable);
		}

		for (const functionName of functionNames) {
			const _func = functionsByName[functionName];
			functions.push(_func);
		}

		const eventDatas: EvaluatorEventData[] = [];
		this.currentJsParentNode().childrenController?.traverseChildren((child) => {
			const eventDataFunction = (child as BaseJsNodeType).eventData;
			if (eventDataFunction && CoreType.isFunction(eventDataFunction)) {
				const eventData = (child as BaseJsNodeType).eventData();
				if (eventData) {
					if (CoreType.isArray(eventData)) {
						eventDatas.push(...eventData);
					} else {
						eventDatas.push(eventData);
					}
				}
			}
		});

		const functionData: ActorFunctionData = {
			functionBody,
			variableNames,
			variablesByName,
			functionNames,
			functionsByName,
			paramConfigs: [...paramConfigs],
			eventDatas,
		};
		return functionData;
	}
	override rootNodesByShaderName(shaderName: JsFunctionName, rootNodes: BaseJsNodeType[]): BaseJsNodeType[] {
		return rootNodes;
	}

	//
	//
	// CONFIGS
	//
	//
	override create_shader_configs() {
		return [new JsShaderConfig(JsFunctionName.MAIN, [], [])];
	}
	override create_variable_configs() {
		return [];
	}
}
