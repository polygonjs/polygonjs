import {
	BaseJsShaderAssembler,
	INSERT_DEFINE_AFTER,
	INSERT_BODY_AFTER,
	INSERT_MEMBERS_AFTER,
	RegisterableVariable,
	FunctionData,
} from '../_Base';
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
import {connectedTriggerableNodes, findTriggeringNodesNonTriggerable, groupNodesByType} from './ActorAssemblerUtils';
import {
	ActorEvaluator,
	EvaluatorEventData,
	// EvaluatorMethodName,
	// EVALUATOR_METHOD_NAMES
} from './Evaluator';
import {BaseJsNodeType} from '../../../_Base';
import {SetUtils} from '../../../../../../core/SetUtils';
import {JsConnectionPointType} from '../../../../utils/io/connections/Js';

import {ArrayUtils} from '../../../../../../core/ArrayUtils';
import {ShadersCollectionController} from '../../utils/ShadersCollectionController';
import {CoreString} from '../../../../../../core/String';
import {PrettierController} from '../../../../../../core/code/PrettierController';
import {CoreType} from '../../../../../../core/Type';
import {computed, ref, watch} from '../../../../../../core/reactivity';
import {ActorEvaluatorGenerator} from './EvaluatorGenerator';
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
class CustomActorEvaluator extends ActorEvaluator {
	${INSERT_MEMBERS_AFTER}
	constructor(scene, object3D){
		super(scene, object3D);
		${INSERT_DEFINE_AFTER}
	}
	${INSERT_BODY_AFTER}
`;
const CLOSE_CLASS_DEFINITION = `};
return CustomActorEvaluator;`;

export class JsAssemblerActor extends BaseJsShaderAssembler {
	// private _function: Function | undefined;
	// private _uniforms: IUniforms | undefined;
	override makeFunctionNodeDirtyOnRecompileRequired() {
		return false;
	}
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

	functionData(): FunctionData | undefined {
		const functionBody = this._shaders_by_name.get(ShaderName.FRAGMENT);
		if (!functionBody) {
			return;
		}
		const variableNames: string[] = [];
		const functionNames: string[] = [];
		const variablesByName: Record<string, RegisterableVariable> = {};
		const functionsByName: Record<string, Function> = {};
		this.traverseRegisteredVariables((variable, varName) => {
			variableNames.push(varName);
			variablesByName[varName] = variable;
		});
		this.traverseRegisteredFunctions((namedFunction) => {
			functionNames.push(namedFunction.type());
			functionsByName[namedFunction.type()] = namedFunction.func;
		});
		const paramConfigs = this.param_configs();
		return {functionBody, variableNames, variablesByName, functionNames, functionsByName, paramConfigs};
	}

	private _triggerNodes: Set<BaseJsNodeType> = new Set();
	private _triggerNodesByType: Map<string, Set<BaseJsNodeType>> = new Map();

	updateEvaluator() {
		logBlue('*************');
		this._reset();
		//
		const node = this.currentGlParentNode() as ActorJsSopNode;
		findTriggeringNodesNonTriggerable(node, this._triggerNodes);
		groupNodesByType(this._triggerNodes, this._triggerNodesByType);

		const shaderNames = this.shaderNames();

		const evaluatorGenerator = this._createNonTriggerables(
			// nodeType as EvaluatorMethodName,
			this._triggerNodes,
			shaderNames
		);
		if (evaluatorGenerator) {
			node.setEvaluatorGenerator(evaluatorGenerator);
		}

		this._triggerNodesByType.forEach((triggerNodes, nodeType) => {
			// if (EVALUATOR_METHOD_NAMES.includes(nodeType as EvaluatorMethodName)) {
			// } else {
			// 	console.warn(`type ${nodeType} not part of evaluator methods`);
			// }
		});
	}
	private _createNonTriggerables(
		// nodeType: EvaluatorMethodName,
		triggerNodes: Set<BaseJsNodeType>,
		shaderNames: ShaderName[]
	) {
		const functionNode = this.currentGlParentNode() as ActorJsSopNode;

		//
		//
		// create computed props
		//
		//
		const _addComputedProps = () => {
			const triggerableNodes: Set<BaseJsNodeType> = new Set();
			triggerableNodes.clear();
			connectedTriggerableNodes({triggerNodes, triggerableNodes, recursive: true});
			const rootNodesSet: Set<BaseJsNodeType> = new Set();
			triggerableNodes.forEach((trigerrableNode) => {
				const rootNodes = ArrayUtils.compact(trigerrableNode.io.inputs.inputs());
				for (let rootNode of rootNodes) {
					if (!triggerableNodes.has(rootNode)) {
						rootNodesSet.add(rootNode);
					}
				}
			});
			const rootNodes = SetUtils.toArray(rootNodesSet);

			this.set_root_nodes(rootNodes);
			if (this._root_nodes.length > 0) {
				this.buildCodeFromNodes(this._root_nodes);
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
		// const functionBody = this._shaders_by_name.get(ShaderName.FRAGMENT);
		// console.log(functionBody);
		//
		//
		// create triggerable methods
		//
		//
		const nodeMethodName = (node: BaseJsNodeType) =>
			CoreString.sanitizeName(node.path().replace(functionNode.path(), ''));

		const _buildTriggerableFunctionLines = () => {
			const triggerableFunctionLines: string[] = [];
			this._triggerNodesByType.forEach((triggerNodes, nodeType) => {
				const triggerableNodes: Set<BaseJsNodeType> = new Set();
				connectedTriggerableNodes({triggerNodes, triggerableNodes, recursive: true});
				for (let node of triggerableNodes) {
					const shadersCollectionController = new ShadersCollectionController(
						this.shaderNames(),
						this.shaderNames()[0],
						this
					);
					node.setLines(shadersCollectionController);
					const bodyLines = shadersCollectionController.bodyLines(ShaderName.FRAGMENT, node);
					if (bodyLines) {
						const methodName = nodeMethodName(node);
						const wrappedLines = `${methodName}(){
			${bodyLines.join('\n')}
		}`;
						triggerableFunctionLines.push(wrappedLines);
					}
				}
			});
			return triggerableFunctionLines;
		};
		const triggerableFunctionLines = _buildTriggerableFunctionLines();
		//
		//
		// create trigger methods
		//
		//
		const _buildTriggerFunctionLines = () => {
			const shadersCollectionController = new ShadersCollectionController(
				this.shaderNames(),
				this.shaderNames()[0],
				this
			);
			const triggerFunctionLines: string[] = [];
			const existingMethodNames: Set<string> = new Set();
			this._triggerNodesByType.forEach((triggerNodes, nodeType) => {
				const triggerableNodes: Set<BaseJsNodeType> = new Set();
				connectedTriggerableNodes({triggerNodes, triggerableNodes, recursive: true});

				const bodyLines: string[] = [];
				for (let triggerableNode of triggerableNodes) {
					const triggerableMethodName = nodeMethodName(triggerableNode);
					bodyLines.push(`this.${triggerableMethodName}()`);
				}
				if (bodyLines.length == 0) {
					// we must not return here,
					// and instead we must let the nodes control
					// if the callback is added based on their own logic.
					// For instance, the onObjectHover will always want
					// to add its own trigger, so that the hovered can be added
					// without its trigger necessarily being used
					// update: onObjectClick does not currently depend on the ref set by onObjectHover
					return;
				}
				// const methodName = nodeType;
				let firstTriggerNode: BaseJsNodeType | undefined;
				triggerNodes.forEach((triggerNode) => {
					firstTriggerNode = firstTriggerNode || triggerNode;
				});
				if (!firstTriggerNode) {
					return;
				}
				const wrappedLinesData = firstTriggerNode.wrappedBodyLines(
					shadersCollectionController,
					bodyLines,
					existingMethodNames
				);
				if (wrappedLinesData) {
					for (let methodName of wrappedLinesData.methodNames) {
						existingMethodNames.add(methodName);
					}
					triggerFunctionLines.push(wrappedLinesData.wrappedLines);
				}
			});
			return triggerFunctionLines;
		};
		const triggerFunctionLines = _buildTriggerFunctionLines();

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
			const functionBodyElements = [
				this._shaders_by_name.get(ShaderName.FRAGMENT),
				triggerableFunctionLines.join('\n'),
				triggerFunctionLines.join('\n'),
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
		const functionNames: string[] = [];
		const variablesByName: Record<string, RegisterableVariable> = {};
		const functionsByName: Record<string, Function> = {};
		this.traverseRegisteredVariables((variable, varName) => {
			variableNames.push(varName);
			variablesByName[varName] = variable;
		});
		this.traverseRegisteredFunctions((namedFunction) => {
			functionNames.push(namedFunction.type());
			functionsByName[namedFunction.type()] = namedFunction.func.bind(namedFunction);
		});
		const paramConfigs = this.param_configs();

		//
		//
		// create evaluator
		//
		//
		const wrappedBody = `
			try {
				${functionBody}
			} catch(e) {
				console.log(e);
				_setErrorFromError(e)
				return null
			}`;
		const _setErrorFromError = (e: Error) => {
			this.currentGlParentNode().states.error.set(e.message);
		};
		const variables: RegisterableVariable[] = [];
		const functions: Function[] = [];
		for (const variableName of variableNames) {
			const variable = variablesByName[variableName];
			variables.push(variable);
		}
		// console.log({functionNames});
		for (const functionName of functionNames) {
			const _func = functionsByName[functionName];
			functions.push(_func);
		}
		const paramConfigUniformNames = paramConfigs.map((pc) => pc.uniformName());

		const functionCreationArgs = [
			'ActorEvaluator',
			'computed',
			'ref',
			'watch',
			'_setErrorFromError',
			...variableNames,
			...functionNames,
			...paramConfigUniformNames,
			wrappedBody,
		];
		const functionEvalArgs = () => [
			ActorEvaluator,
			computed,
			ref,
			watch,
			_setErrorFromError,
			// it is currently preferable to create a unique set of variables
			// for each evaluator
			...variables.map((v) => v.clone()),
			...functions,
		];
		// console.log(functionCreationArgs, functionEvalArgs);
		try {
			const _function = new Function(...functionCreationArgs);
			const node = this.currentGlParentNode() as ActorJsSopNode;
			const evaluatorGenerator = new ActorEvaluatorGenerator((object) => {
				const evaluatorClass = _function(...functionEvalArgs()) as typeof ActorEvaluator;
				return new evaluatorClass(node.scene(), object);
			});
			// console.log({evaluator});

			//
			//
			// add inputEvents
			//
			//
			const eventDatas: Set<EvaluatorEventData> = new Set();
			functionNode.childrenController?.traverseChildren((child) => {
				const eventDataFunction = (child as BaseJsNodeType).eventData;
				if (eventDataFunction && CoreType.isFunction(eventDataFunction)) {
					const eventData = (child as BaseJsNodeType).eventData();
					if (eventData) {
						eventDatas.add(eventData);
					}
				}
			});
			evaluatorGenerator.eventDatas = eventDatas;

			//
			//
			// evaluator is ready
			//
			//
			return evaluatorGenerator;
		} catch (e) {
			console.warn(e);
			this.currentGlParentNode().states.error.set('failed to compile');
		}
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
