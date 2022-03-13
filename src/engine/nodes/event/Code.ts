/**
 * processes input events with user-defined typescript.
 *
 *
 */

import {TypedEventNode} from './_Base';
import {EventContext} from '../../scene/utils/events/_BaseEventsController';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {Poly} from '../../Poly';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';
import * as THREE from 'three'; // three import required to give to the function builder

const DEFAULT_FUNCTION_CODE = {
	TS: `
export class EventProcessor extends BaseCodeEventProcessor {
	override initializeProcessor(){
	}
	override processTrigger0(eventContext: EventContext<MouseEvent>){
		this.dispatchEventToOutput('output0', eventContext);
	}
	override processTrigger1(eventContext: EventContext<MouseEvent>){
		this.dispatchEventToOutput('output1', eventContext);
	}
	override processTrigger2(eventContext: EventContext<MouseEvent>){
		this.dispatchEventToOutput('output2', eventContext);
	}
	override processTrigger3(eventContext: EventContext<MouseEvent>){
		this.dispatchEventToOutput('output3', eventContext);
	}
	override processTrigger4(eventContext: EventContext<MouseEvent>){
		this.dispatchEventToOutput('output4', eventContext);
	}
}
`,
	JS: `
export class EventProcessor extends BaseCodeEventProcessor {
	initializeProcessor() {
	}
	processTrigger0(eventContext) {
		this.dispatchEventToOutput('output0', eventContext);
	}
	processTrigger1(eventContext) {
		this.dispatchEventTgfoOutput('output1', eventContext);
	}
	processTrigger2(eventContext) {
		this.dispatchEventTgfoOutput('output2', eventContext);
	}
	processTrigger3(eventContext) {
		this.dispatchEventTgfoOutput('output3', eventContext);
	}
	processTrigger4(eventContext) {
		this.dispatchEventTgfoOutput('output4', eventContext);
	}
}
`,
};

export class BaseCodeEventProcessor {
	constructor(protected node: CodeEventNode) {
		this.initializeProcessor();
	}
	initializeProcessor() {}
	processTrigger0(eventContext: EventContext<Event>) {}
	processTrigger1(eventContext: EventContext<Event>) {}
	processTrigger2(eventContext: EventContext<Event>) {}
	processTrigger3(eventContext: EventContext<Event>) {}
	processTrigger4(eventContext: EventContext<Event>) {}
	dispatchEventToOutput(outputName: string, eventContext: EventContext<Event>) {
		console.log('dispatch', outputName, eventContext);
		this.node._dispatchEventToOutputFromProcessor(outputName, eventContext);
	}
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class CodeEventParamsConfig extends NodeParamsConfig {
	codeTypescript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE.TS, {
		hideLabel: true,
		language: StringParamLanguage.TYPESCRIPT,
	});
	codeJavascript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE.JS, {hidden: true});
}
const ParamsConfig = new CodeEventParamsConfig();

export class CodeEventNode extends TypedEventNode<CodeEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	// adding BaseCodeEventProcessor seems necessary to have the bundled types include it
	static BaseCodeEventProcessor = BaseCodeEventProcessor;
	static override type() {
		return 'code';
	}
	private _lastCompiledCode: string | undefined;
	private _processor: BaseCodeEventProcessor | undefined;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint('trigger0', EventConnectionPointType.BASE, this._processTrigger0.bind(this)),
			new EventConnectionPoint('trigger1', EventConnectionPointType.BASE, this._processTrigger1.bind(this)),
			new EventConnectionPoint('trigger2', EventConnectionPointType.BASE, this._processTrigger2.bind(this)),
			new EventConnectionPoint('trigger3', EventConnectionPointType.BASE, this._processTrigger3.bind(this)),
			new EventConnectionPoint('trigger4', EventConnectionPointType.BASE, this._processTrigger4.bind(this)),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint('output0', EventConnectionPointType.BASE),
			new EventConnectionPoint('output1', EventConnectionPointType.BASE),
			new EventConnectionPoint('output2', EventConnectionPointType.BASE),
			new EventConnectionPoint('output3', EventConnectionPointType.BASE),
			new EventConnectionPoint('output4', EventConnectionPointType.BASE),
		]);
	}

	private _processTrigger0(event_context: EventContext<Event>) {
		this._compileIfRequired();
		this._processor?.processTrigger0(event_context);
	}
	private _processTrigger1(event_context: EventContext<Event>) {
		this._compileIfRequired();
		this._processor?.processTrigger1(event_context);
	}
	private _processTrigger2(event_context: EventContext<Event>) {
		this._compileIfRequired();
		this._processor?.processTrigger2(event_context);
	}
	private _processTrigger3(event_context: EventContext<Event>) {
		this._compileIfRequired();
		this._processor?.processTrigger3(event_context);
	}
	private _processTrigger4(event_context: EventContext<Event>) {
		this._compileIfRequired();
		this._processor?.processTrigger4(event_context);
	}
	_dispatchEventToOutputFromProcessor(outputName: string, eventContext: EventContext<Event>) {
		this.dispatchEventToOutput(outputName, eventContext);
	}

	private _compileIfRequired() {
		if (!this._processor || this._lastCompiledCode != this.pv.codeJavascript) {
			this._compile();
		}
	}
	private _compile() {
		try {
			console.log(this.pv.codeJavascript);
			const functionBody = `try {
				${TranspiledFilter.filter(this.pv.codeJavascript)}
			} catch(e) {
				this.states.error.set(e)
			}`;
			const processorCreatorFunction: Function = new Function('BaseCodeEventProcessor', 'THREE', functionBody);
			const ProcessorClass: typeof BaseCodeEventProcessor | undefined = processorCreatorFunction(
				BaseCodeEventProcessor,
				THREE
			);
			if (ProcessorClass) {
				this._processor = new ProcessorClass(this);
				this._lastCompiledCode = this.pv.codeJavascript;
			} else {
				this.states.error.set(`cannot generate function`);
				console.log(functionBody);
				this._processor = undefined;
			}
		} catch (e) {
			Poly.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
			this._processor = undefined;
		}
	}
}
