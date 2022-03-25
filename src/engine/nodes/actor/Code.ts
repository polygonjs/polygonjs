/**
 * processes input events
 *
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {
	ActorConnectionPoint,
	ActorConnectionPointType,
	ACTOR_CONNECTION_POINT_IN_NODE_DEF,
	ReturnValueTypeByActorConnectionPointType,
} from '../utils/io/connections/Actor';
import {BaseNodeType} from '../_Base';
import {ParamType} from '../../poly/ParamType';
import {ActorNodeParamConstructorMap} from './utils/ActorNodeInputParam';
import {ParamValuesTypeMap} from '../../params/types/ParamValuesTypeMap';
import {ActorNodeTriggerContext, TRIGGER_CONNECTION_NAME, TypedActorNode} from './_Base';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';
import {Poly} from '../../Poly';
import * as THREE from 'three'; // three import required to give to the function builder

const CONNECTION_OPTIONS = ACTOR_CONNECTION_POINT_IN_NODE_DEF;

const DEFAULT_TS = `
export class CodeActorProcessor extends BaseCodeActorProcessor {
	override initializeProcessor(){
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint('myBool', ActorConnectionPointType.BOOLEAN),
		]);
	}
	override receiveTrigger(context: ActorNodeTriggerContext){
		const {Object3D} = context;
		Object3D.position.y += 1;
		Object3D.updateMatrix();
	}
}
`;
const DEFAULT_JS = DEFAULT_TS.replace(/\:\sActorNodeTriggerContext/g, '').replace(/override\s/g, '');

export class BaseCodeActorProcessor {
	constructor(protected node: CodeActorNode) {
		this.initializeProcessor();
	}
	get pv() {
		return this.node.pv;
	}
	get p() {
		return this.node.p;
	}
	get io() {
		return this.node.io;
	}
	protected _inputValueFromParam<T extends ParamType>(
		param: ActorNodeParamConstructorMap[T],
		context: ActorNodeTriggerContext
	): ParamValuesTypeMap[T] {
		return this.node._processorHookInputValueFromParam(param, context);
	}
	protected _inputValue<T extends ActorConnectionPointType>(
		inputNameOrIndex: string | number,
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[T] | undefined {
		return this.node._processorHookInputValue(inputNameOrIndex, context);
	}
	runTrigger(context: ActorNodeTriggerContext, outputIndex = 0) {
		this.node.runTrigger(context, outputIndex);
	}
	initializeProcessor() {}
	receiveTrigger(context: ActorNodeTriggerContext) {}
}

class CodeActorParamsConfig extends NodeParamsConfig {
	compile = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			CodeActorNode.PARAM_CALLBACK_compile(node as CodeActorNode);
		},
	});
	codeTypescript = ParamConfig.STRING(DEFAULT_TS, {
		hideLabel: true,
		language: StringParamLanguage.TYPESCRIPT,
	});
	codeJavascript = ParamConfig.STRING(DEFAULT_JS, {
		hidden: true,
		callback: (node: BaseNodeType) => {
			CodeActorNode.PARAM_CALLBACK_compile(node as CodeActorNode);
		},
	});
}
const ParamsConfig = new CodeActorParamsConfig();
export class CodeActorNode extends TypedActorNode<CodeActorParamsConfig> {
	override paramsConfig = ParamsConfig;
	// adding BaseCodeActorProcessor seems necessary to have the bundled types include it
	static BaseCodeActorProcessor = BaseCodeActorProcessor;
	static override type() {
		return 'code';
	}

	private _processor: BaseCodeActorProcessor | undefined;

	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['codeTypescript', 'codeJavascript']);
		this.io.inputs.setNamedInputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new ActorConnectionPoint(
				ActorConnectionPointType.OBJECT_3D,
				ActorConnectionPointType.OBJECT_3D,
				CONNECTION_OPTIONS
			),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new ActorConnectionPoint(TRIGGER_CONNECTION_NAME, ActorConnectionPointType.TRIGGER),
		]);
		this.params.onParamsCreated('compile', () => {
			this._compile();
		});
	}

	public override receiveTrigger(context: ActorNodeTriggerContext) {
		this._processor?.receiveTrigger(context);
	}

	private _compile() {
		this._processor = undefined;
		try {
			const functionBody = `try {
	${TranspiledFilter.filter(this.pv.codeJavascript)}
} catch(e) {
		this.states.error.set(e)
}`;

			const processorCreatorFunction = new Function(
				'ActorConnectionPoint',
				'ActorConnectionPointType',
				'BaseCodeActorProcessor',
				'THREE',
				functionBody
			);
			const ProcessorClass: typeof BaseCodeActorProcessor | undefined = processorCreatorFunction(
				ActorConnectionPoint,
				ActorConnectionPointType,
				BaseCodeActorProcessor,
				THREE
			);
			if (ProcessorClass) {
				this._processor = new ProcessorClass(this);
				// this._lastCompiledCode = this.pv.codeJavascript;
			} else {
				this.states.error.set(`cannot generate function`);
				Poly.warn(functionBody);
			}
		} catch (e) {
			Poly.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
		}
	}
	static PARAM_CALLBACK_compile(node: CodeActorNode) {
		node._compile();
	}

	/*
	 *
	 * hooks for the processor
	 *
	 */
	public _processorHookInputValueFromParam<T extends ParamType>(
		param: ActorNodeParamConstructorMap[T],
		context: ActorNodeTriggerContext
	): ParamValuesTypeMap[T] {
		return this._inputValueFromParam(param, context);
	}
	public _processorHookInputValue<T extends ActorConnectionPointType>(
		inputNameOrIndex: string | number,
		context: ActorNodeTriggerContext
	): ReturnValueTypeByActorConnectionPointType[T] | undefined {
		return this._inputValue(inputNameOrIndex, context);
	}
}
