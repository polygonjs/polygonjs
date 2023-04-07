import {
	BaseJsShaderAssembler,
	INSERT_DEFINE_AFTER,
	INSERT_CONSTRUCTOR_AFTER,
	INSERT_BODY_AFTER,
	// INSERT_TRIGGER_AFTER,
	// INSERT_TRIGGERABLE_AFTER,
	INSERT_MEMBERS_AFTER,
} from '../_Base';
import {RegisterableVariable} from '../_BaseJsPersistedConfigUtils';
// import {IUniforms} from '../../../../../../core/geometry/Material';
// import {ThreeToGl} from '../../../../../../core/ThreeToGl';
// import TemplateDefault from '../../templates/textures/Default.frag.glsl';
import {ShaderConfig} from '../../configs/ShaderConfig';
// import {VariableConfig} from '../../configs/VariableConfig';
import {ShaderName} from '../../../../utils/shaders/ShaderName';
// import {OutputJsNode} from '../../../Output';
// import {GlobalsJsNode} from '../../../Globals';
// import {JsConnectionPointType, JsConnectionPoint} from '../../../../utils/io/connections/Js';
// import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
// import {UniformJsDefinition} from '../../../utils/JsDefinition';
// import {Vector3} from 'three';
import {ActorJsSopNode} from '../../../../sop/ActorJs';
import {
	connectedTriggerableNodes,
	findTriggeringNodes,
	// groupNodesByType,
	inputNodesExceptTrigger,
} from './ActorAssemblerUtils';
import {BaseJsNodeType} from '../../../_Base';
import {SetUtils} from '../../../../../../core/SetUtils';
// import {JsConnectionPointType} from '../../../../utils/io/connections/Js';
// import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
// import {CoreString} from '../../../../../../core/String';
import {PrettierController} from '../../../../../../core/code/PrettierController';
import {NamedFunctionMap} from '../../../../../poly/registers/functions/All';
import {ActorFunctionData} from './ActorPersistedConfig';
import {EvaluatorEventData} from './Evaluator';
import {CoreType} from '../../../../../../core/Type';
import {ParamOptions} from '../../../../../params/utils/OptionsController';
import {JsConnectionPointType} from '../../../../utils/io/connections/Js';
// import {Vector3} from 'three';
// import {IUniformsWithTime} from '../../../../../scene/utils/UniformsController';
// import {handleCopBuilderDependencies} from '../../../../cop/utils/BuilderUtils';
// import { JSSDFSopNode } from '../../../../sop/JSSDF';

function logBlue(message: string) {
	console.log('%c' + message, 'color:blue; font-weight:bold;');
}
// function logGreen(message: string) {
// 	console.log('%c' + message, 'color:green; font-weight:bold;');
// }

const TEMPLATE = `
${INSERT_DEFINE_AFTER}
class CustomActorEvaluator extends ActorEvaluator {
	${INSERT_MEMBERS_AFTER}
	constructor(scene, object3D){
		super(scene, object3D);
		${INSERT_CONSTRUCTOR_AFTER}
	}
	${INSERT_BODY_AFTER}
`;
const CLOSE_CLASS_DEFINITION = `};
return CustomActorEvaluator;`;

export class JsAssemblerActor extends BaseJsShaderAssembler {
	// private _function: Function | undefined;
	// private _uniforms: IUniforms | undefined;
	// override makeFunctionNodeDirtyOnRecompileRequired() {
	// 	return false;
	// }
	override templateShader() {
		return {
			fragmentShader: TEMPLATE,
			vertexShader: undefined,
			uniforms: undefined,
		};
	}
	override inputNamesForShaderName(rootNode: BaseJsNodeType, shaderName: ShaderName) {
		return rootNode.io.inputs
			.namedInputConnectionPoints()
			.filter((cp) => cp.type() != JsConnectionPointType.TRIGGER)
			.map((cp) => cp.name());
	}
	override computedVariablesAllowed(): boolean {
		return true;
	}
	override spareParamsOptions() {
		const _options: ParamOptions = {
			spare: true,
			computeOnDirty: true,
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

	// functionData(): FunctionData | undefined {
	// 	const functionBody = this._shaders_by_name.get(ShaderName.FRAGMENT);
	// 	if (!functionBody) {
	// 		return;
	// 	}
	// 	const variableNames: string[] = [];
	// 	const functionNames: Array<keyof NamedFunctionMap> = [];
	// 	const variablesByName: Record<string, RegisterableVariable> = {};
	// 	const functionsByName: Record<string, Function> = {};
	// 	this.traverseRegisteredVariables((variable, varName) => {
	// 		variableNames.push(varName);
	// 		variablesByName[varName] = variable;
	// 	});
	// 	this.traverseRegisteredFunctions((namedFunction) => {
	// 		functionNames.push(namedFunction.type() as keyof NamedFunctionMap);
	// 		functionsByName[namedFunction.type()] = namedFunction.func;
	// 	});
	// 	console.log(this.param_configs());
	// 	const serializedParamConfigs = this.param_configs().map((pc) => pc.toJSON());
	// 	return {functionBody, variableNames, variablesByName, functionNames, functionsByName, serializedParamConfigs};
	// }

	// private _triggerNodes: Set<BaseJsNodeType> = new Set();
	// private _triggerNodesByType: Map<string, Set<BaseJsNodeType>> = new Map();

	createFunctionData(additionalRootNodes: BaseJsNodeType[]): ActorFunctionData | undefined {
		logBlue('*************');
		this._reset();
		//
		const node = this.currentGlParentNode() as ActorJsSopNode;
		const triggeringNodes = findTriggeringNodes(node);
		const triggerableNodes = new Set<BaseJsNodeType>();
		connectedTriggerableNodes({triggeringNodes, triggerableNodes, recursive: true});
		// groupNodesByType(triggeringNodes, this._triggerNodesByType);

		const shaderNames = this.shaderNames();

		const functionData = this._createFunctionData(
			// nodeType as EvaluatorMethodName,
			additionalRootNodes,
			triggeringNodes,
			triggerableNodes,
			shaderNames
		);

		return functionData;
	}
	private _createFunctionData(
		// nodeType: EvaluatorMethodName,
		additionalRootNodes: BaseJsNodeType[],
		triggeringNodes: Set<BaseJsNodeType>,
		triggerableNodes: Set<BaseJsNodeType>,
		shaderNames: ShaderName[]
	): ActorFunctionData | undefined {
		const functionNode = this.currentGlParentNode() as ActorJsSopNode;

		//
		//
		// create computed props
		//
		//
		const _addComputedProps = () => {
			// const triggerableNodes: Set<BaseJsNodeType> = new Set();
			// triggerableNodes.clear();
			// connectedTriggerableNodes({triggeringNodes, triggerableNodes, recursive: true});
			const rootNodesSet: Set<BaseJsNodeType> = new Set();
			triggerableNodes.forEach((trigerrableNode) => {
				const rootNodes = inputNodesExceptTrigger(trigerrableNode);
				for (let rootNode of rootNodes) {
					// if (!triggerableNodes.has(rootNode)) {
					rootNodesSet.add(rootNode);
					// }
				}
			});
			const rootNodes = SetUtils.toArray(rootNodesSet).concat(additionalRootNodes);

			this.set_root_nodes(rootNodes);
			if (this._root_nodes.length > 0 || triggerableNodes.size > 0) {
				this.buildCodeFromNodes(this._root_nodes, {
					actor: {
						functionNode,
						triggeringNodes: triggeringNodes,
						triggerableNodes: triggerableNodes,
					},
				});

				this._buildLines();
			}
			for (let shaderName of shaderNames) {
				const lines = this._lines.get(shaderName);
				if (lines) {
					this._shaders_by_name.set(shaderName, lines.join('\n'));
				}
			}
		};
		_addComputedProps();

		// //
		// //
		// // create triggerable methods
		// //
		// //
		// const nodeMethodName = (node: BaseJsNodeType) =>
		// 	CoreString.sanitizeName(node.path().replace(functionNode.path(), ''));

		// const _buildTriggerableFunctionLines = () => {
		// 	const triggerableFunctionLines: string[] = [];
		// 	this._triggerNodesByType.forEach((triggerNodes, nodeType) => {
		// 		const triggerableNodes: Set<BaseJsNodeType> = new Set();
		// 		connectedTriggerableNodes({triggerNodes, triggerableNodes, recursive: true});
		// 		for (let node of triggerableNodes) {
		// 			const shadersCollectionController = new ShadersCollectionController(
		// 				this.shaderNames(),
		// 				this.shaderNames()[0],
		// 				this
		// 			);
		// 			shadersCollectionController.setAllowActionLines(true);
		// 			node.setLines(shadersCollectionController);
		// 			const bodyLines = shadersCollectionController.bodyLines(ShaderName.FRAGMENT, node);
		// 			if (bodyLines) {
		// 				const methodName = nodeMethodName(node);
		// 				const wrappedLines = `${methodName}(){
		// 	${bodyLines.join('\n')}
		// }`;
		// 				triggerableFunctionLines.push(wrappedLines);
		// 			}
		// 		}
		// 	});
		// 	return triggerableFunctionLines;
		// };
		// const triggerableFunctionLines = _buildTriggerableFunctionLines();
		//
		//
		// create trigger methods
		//
		//
		// const _buildTriggerFunctionLines = () => {
		// 	const shadersCollectionController = new ShadersCollectionController(
		// 		this.shaderNames(),
		// 		this.shaderNames()[0],
		// 		this
		// 	);
		// 	// shadersCollectionController.setAllowActionLines(true);
		// 	const triggerFunctionLines: string[] = [];
		// 	const existingMethodNames: Set<string> = new Set();
		// 	this._triggerNodesByType.forEach((triggerNodes, nodeType) => {
		// 		const triggerableNodes: Set<BaseJsNodeType> = new Set();
		// 		connectedTriggerableNodes({triggerNodes, triggerableNodes, recursive: true});

		// 		const bodyLines: string[] = [];
		// 		for (let triggerableNode of triggerableNodes) {
		// 			const triggerableMethodName = nodeMethodName(triggerableNode);
		// 			bodyLines.push(`this.${triggerableMethodName}()`);
		// 		}
		// 		if (bodyLines.length == 0) {
		// 			// we must not return here,
		// 			// and instead we must let the nodes control
		// 			// if the callback is added based on their own logic.
		// 			// For instance, the onObjectHover will always want
		// 			// to add its own trigger, so that the hovered can be added
		// 			// without its trigger necessarily being used
		// 			// update: onObjectClick does not currently depend on the ref set by onObjectHover
		// 			return;
		// 		}
		// 		// const methodName = nodeType;
		// 		let firstTriggerNode: BaseJsNodeType | undefined;
		// 		triggerNodes.forEach((triggerNode) => {
		// 			firstTriggerNode = firstTriggerNode || triggerNode;
		// 		});
		// 		if (!firstTriggerNode) {
		// 			return;
		// 		}
		// 		const wrappedLinesData = firstTriggerNode.wrappedBodyLines(
		// 			shadersCollectionController,
		// 			bodyLines,
		// 			existingMethodNames
		// 		);
		// 		if (wrappedLinesData) {
		// 			for (let methodName of wrappedLinesData.methodNames) {
		// 				existingMethodNames.add(methodName);
		// 			}
		// 			triggerFunctionLines.push(wrappedLinesData.wrappedLines);
		// 		}
		// 	});
		// 	return triggerFunctionLines;
		// };
		// const triggerFunctionLines = _buildTriggerFunctionLines();

		// const paramNodes = JsNodeFinder.findParamGeneratingNodes(this);
		// const rootNodes = SetUtils.toArray(this._triggerableNodes); //outputNodes.concat(paramNodes);
		// this.set_root_nodes(rootNodes);
		// console.log('root nodes:', this._root_nodes, this._triggerableNodes);
		// if (this._root_nodes.length > 0) {
		// 	this.buildCodeFromNodes(this._root_nodes);
		// 	this._buildLines();
		// }
		// for (let shaderName of shaderNames) {
		// 	const lines = this._lines.get(shaderName);
		// 	if (lines) {
		// 		this._shaders_by_name.set(shaderName, lines.join('\n'));
		// 	}
		// }
		// const functionBody = this._shaders_by_name.get(ShaderName.FRAGMENT);
		// console.log(functionBody);

		//
		//
		// ASSEMBLE FUNCTION BODY
		//
		//
		const _buildFunctionBody = () => {
			const bodyLines = this._shaders_by_name.get(ShaderName.FRAGMENT) || TEMPLATE;
			const functionBodyElements = [
				bodyLines,
				// triggerableFunctionLines.join('\n'),
				// triggerFunctionLines.join('\n'),
				CLOSE_CLASS_DEFINITION,
			];
			const functionBody = PrettierController.formatJs(functionBodyElements.join('\n'));
			return functionBody;
		};
		const functionBody = _buildFunctionBody();
		console.log(functionBody);
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
		this._gl_parent_node.childrenController?.traverseChildren((child) => {
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
	override rootNodesByShaderName(shaderName: ShaderName, rootNodes: BaseJsNodeType[]): BaseJsNodeType[] {
		return rootNodes;
	}

	// private _evaluationContext: EvaluationContext = {};
	// private _createEvaluatorFunction(
	// 	actorEvaluator: ActorEvaluator,
	// 	nodeType: EvaluatorMethodName,
	// 	triggerNodes: Set<BaseJsNodeType>,
	// 	shaderNames: ShaderName[]
	// ) {
	// 	this._resetRegisteredFunctions();
	// 	this._resetRegisteredVariables();

	// 	connectedTriggerableNodes({triggerNodes, triggerableNodes: this._triggerableNodes});

	// 	// const paramNodes = JsNodeFinder.findParamGeneratingNodes(this);
	// 	const rootNodes = SetUtils.toArray(this._triggerableNodes); //outputNodes.concat(paramNodes);
	// 	this.set_root_nodes(rootNodes);
	// 	console.log(nodeType, this._root_nodes);
	// 	if (this._root_nodes.length > 0) {
	// 		this.buildCodeFromNodes(this._root_nodes);
	// 		this._buildLines();
	// 	}
	// 	for (let shaderName of shaderNames) {
	// 		const lines = this._lines.get(shaderName);
	// 		if (lines) {
	// 			this._shaders_by_name.set(shaderName, lines.join('\n'));
	// 		}
	// 	}
	// 	const functionBody = this._shaders_by_name.get(ShaderName.FRAGMENT);
	// 	console.log(functionBody);

	// 	const variableNames: string[] = [];
	// 	const functionNames: string[] = [];
	// 	const variablesByName: Record<string, RegisterableVariable> = {};
	// 	const functionsByName: Record<string, Function> = {};
	// 	this.traverseRegisteredVariables((variable, varName) => {
	// 		variableNames.push(varName);
	// 		variablesByName[varName] = variable;
	// 	});
	// 	this.traverseRegisteredFunctions((namedFunction) => {
	// 		functionNames.push(namedFunction.type);
	// 		functionsByName[namedFunction.type] = namedFunction.func;
	// 	});
	// 	const paramConfigs = this.param_configs();

	// 	const wrappedBody = `
	// 		try {
	// 			const { Object3D } = context;
	// 			${functionBody}
	// 		} catch(e) {
	// 			_setErrorFromError(e)
	// 			return 0;
	// 		}`;
	// 	const _setErrorFromError = (e: Error) => {
	// 		this.currentGlParentNode().states.error.set(e.message);
	// 	};
	// 	const variables: RegisterableVariable[] = [];
	// 	const functions: Function[] = [];
	// 	for (const variableName of variableNames) {
	// 		const variable = variablesByName[variableName];
	// 		variables.push(variable);
	// 	}
	// 	for (const functionName of functionNames) {
	// 		const _func = functionsByName[functionName];
	// 		functions.push(_func);
	// 	}
	// 	const paramConfigUniformNames = paramConfigs.map((pc) => pc.uniformName());

	// 	const functionCreationArgs = [
	// 		'context',
	// 		'_setErrorFromError',
	// 		...variableNames,
	// 		...functionNames,
	// 		...paramConfigUniformNames,
	// 		wrappedBody,
	// 	];
	// 	const functionEvalArgs = [this._evaluationContext, _setErrorFromError, ...variables, ...functions];
	// 	try {
	// 		const _function = new Function(...functionCreationArgs);
	// 		actorEvaluator[nodeType] = (evaluationContext: EvaluationContext) => {
	// 			this._evaluationContext.Object3D = evaluationContext.Object3D;
	// 			_function(...functionEvalArgs);
	// 		};
	// 	} catch (e) {
	// 		console.warn(e);
	// 		this.currentGlParentNode().states.error.set('failed to compile');
	// 	}
	// }

	//
	//
	// CHILDREN NODES PARAMS
	//
	//
	// override add_output_inputs(output_child: OutputJsNode) {
	// 	// output_child.add_param(ParamType.COLOR, 'color', [1, 1, 1], {hidden: true});
	// 	// output_child.add_param(ParamType.FLOAT, 'alpha', 1, {hidden: true});
	// 	output_child.io.inputs.setNamedInputConnectionPoints([
	// 		// new JsConnectionPoint(SDFVariable.D, JsConnectionPointType.FLOAT),
	// 		// new JsConnectionPoint('alpha', JsConnectionPointType.FLOAT),
	// 	]);
	// }
	// override add_globals_outputs(globals_node: GlobalsJsNode) {
	// 	globals_node.io.outputs.setNamedOutputConnectionPoints([
	// 		// new JsConnectionPoint('time', JsConnectionPointType.FLOAT),
	// 		// new JsConnectionPoint('gl_FragCoord', JsConnectionPointType.VEC4),
	// 		// new JsConnectionPoint('resolution', JsConnectionPointType.VEC2),
	// 		// new JsConnectionPoint('time', JsConnectionPointType.FLOAT),
	// 		// new Connection.Vec2('resolution'),
	// 	]);
	// }

	//
	//
	// CONFIGS
	//
	//
	override create_shader_configs() {
		return [new ShaderConfig(ShaderName.FRAGMENT, [], [])];
	}
	override create_variable_configs() {
		return [];
	}
}
