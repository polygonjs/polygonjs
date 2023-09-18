/**
 * processes input events
 *
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
// import {ParamType} from '../../poly/ParamType';
// import {JsNodeParamConstructorMap} from './utils/JsNodeInputParam';
// import {ParamValuesTypeMap} from '../../params/types/ParamValuesTypeMap';
import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';
// import {Poly} from '../../Poly';
import {BaseCodeProcessor, buildCodeNodeFunction} from '../../../core/code/FunctionBuilderUtils';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';
import {inputObject3D} from './_BaseObject3D';
import {JsAssemblerActor} from './code/assemblers/actor/ActorAssembler';
import {JsFunctionName} from '../utils/shaders/ShaderName';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {BaseNodeType} from '../_Base';
// import {BaseNodeType} from '../_Base';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

interface CompileOptions {
	triggerFunctionNode: boolean;
}

export const JS_CODE_DEFAULT_TS = `
export class CodeJsProcessor extends BaseCodeJsProcessor {
	override initializeProcessor(){
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint('myBoolParam', JsConnectionPointType.BOOLEAN),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER),
		]);
	}
	override setTriggerableLines(controller: JsLinesCollectionController) {
		const object3D = this.inputObject3D(this, controller);
		const myBoolParam = this.variableForInput(controller, 'myBoolParam');

		const bodyLines = [
			object3D + '.position.y += ' + myBoolParam + ' ? -1 : 1;',
			object3D + '.updateMatrix()'
		];
		this.addTriggerableLines(controller, bodyLines);
	}
}
`;
const DEFAULT_JS = JS_CODE_DEFAULT_TS.replace(/\:\sJsLinesCollectionController/g, '').replace(/override\s/g, '');

export class BaseCodeJsProcessor extends BaseCodeProcessor {
	constructor(protected override node: CodeJsNode) {
		super(node);
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

	initializeProcessor() {}
	setTriggerableLines(controller: JsLinesCollectionController) {}

	inputObject3D(processor: BaseCodeJsProcessor, controller: JsLinesCollectionController) {
		return inputObject3D(this.node, controller);
	}

	protected variableForInput(controller: JsLinesCollectionController, inputName: string) {
		return this.node.variableForInput(controller, inputName);
	}
	protected addTriggerableLines(controller: JsLinesCollectionController, bodyLines: string[]) {
		return controller.addTriggerableLines(this.node, bodyLines);
	}
}

class CodeJsParamsConfig extends NodeParamsConfig {
	// compile = ParamConfig.BUTTON(null, {
	// 	callback: (node: BaseNodeType) => {
	// 		CodeJsNode.PARAM_CALLBACK_compile(node as CodeJsNode);
	// 	},
	// 	cook: false,
	// });
	codeTypescript = ParamConfig.STRING(JS_CODE_DEFAULT_TS, {
		hideLabel: true,
		language: StringParamLanguage.TYPESCRIPT,
		cook: false,
	});
	codeJavascript = ParamConfig.STRING(DEFAULT_JS, {
		hidden: true,
		cook: false,
		callback: (node: BaseNodeType) => {
			CodeJsNode.PARAM_CALLBACK_requestCompile(node as CodeJsNode);
		},
	});
}
const ParamsConfig = new CodeJsParamsConfig();
export class CodeJsNode extends TypedJsNode<CodeJsParamsConfig> {
	override paramsConfig = ParamsConfig;
	// adding BaseCodeJsProcessor seems necessary to have the bundled types include it
	static BaseCodeJsProcessor = BaseCodeJsProcessor;
	static override type() {
		return JsType.CODE;
	}

	protected _processor: BaseCodeJsProcessor | undefined;

	override initializeNode() {
		this.io.connection_points.spare_params.setInputlessParamNames(['codeTypescript', 'codeJavascript']);
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
		this.params.onParamsCreated('compile', () => {
			this.compile({triggerFunctionNode: false});
		});
		// this.addPostDirtyHook('compile', () => {
		// 	this.compile({triggerFunctionNode: true});
		// });
	}
	// override cook() {
	// 	// try {

	// 	// }catch(err){

	// 	// }
	// 	this.compile({triggerFunctionNode: false});
	// 	console.log('COOK: this.compiled()', this.compiled());
	// 	// if (this.compiled()) {

	// 	// } // else {
	// 	//	this.states.error.set(`cannot generate function`);
	// 	//}
	// 	this.cookController.endCook();
	// }

	override setTriggerableLines(controller: JsLinesCollectionController) {
		this._processor?.setTriggerableLines(controller);
	}

	private _lastCompiledCode: string | undefined;
	private _compilationSuccessful = false;
	compiled(): boolean {
		return this._compilationSuccessful;
	}
	compile(options: CompileOptions) {
		const content = TranspiledFilter.filter(this.pv.codeJavascript);
		if (this._lastCompiledCode == content) {
			return;
		}

		this._compilationSuccessful = false;
		this._lastCompiledCode = undefined;
		this._processor = undefined;
		this.states.error.clear();

		const _preventSelfCompilation = () => {
			this._setFunctionNodeToRecompileAllowed(false);
			// this.dirtyController.setForbiddenTriggerNodes([this, this.io.inputs.graphNode()]);
			this.setSelfDirtyForbidden(true);
			this.io.inputs.graphNode().setForbiddenTriggerNodes(this);
		};
		const _restore = () => {
			this._setFunctionNodeToRecompileAllowed(true);
			// this.dirtyController.setForbiddenTriggerNodes([]);
			this.setSelfDirtyForbidden(false);
			this.io.inputs.graphNode().clearForbiddenTriggerNodes();
		};

		try {
			const functionBody = `try {
	${content}
} catch(e) {
		states.error.set(e);
}`;

			const ProcessorClass = buildCodeNodeFunction<BaseCodeJsProcessor>({
				BaseCodeProcessor: BaseCodeJsProcessor,
				BaseCodeProcessorName: 'BaseCodeJsProcessor',
				node: this,
				functionBody,
				otherVariables: {
					['JsConnectionPoint']: JsConnectionPoint,
					['JsConnectionPointType']: JsConnectionPointType,
				},
			});
			if (!ProcessorClass) {
				throw new Error(`cannot generate function`);
				// this.states.error.set(`cannot generate function (${e})`);
				// return
			}
			if (ProcessorClass) {
				this._processor = new ProcessorClass(this);

				_preventSelfCompilation();

				this._processor.initializeProcessor();

				// test the generated processor
				const dummyAssembler = new JsAssemblerActor(this.functionNode()!);
				const dummyShadersCollectionController = new JsLinesCollectionController(
					[JsFunctionName.MAIN],
					JsFunctionName.MAIN,
					dummyAssembler
				);
				this._processor.setTriggerableLines(dummyShadersCollectionController);

				_restore();

				this._compilationSuccessful = true;
				this._lastCompiledCode = content;

				this.states.error.clear();
				if (options.triggerFunctionNode) {
					this._setFunctionNodeToRecompile();
				}
			} // else {
			//	this.states.error.set(`cannot generate function`);
			//	Poly.warn(functionBody);
			//}
			// console.log('BADDD');
		} catch (e) {
			_restore();
			// Poly.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
			if (options.triggerFunctionNode) {
				this._setFunctionNodeToRecompile();
			}
			// throw new Error(`cannot generate function`);
		}
	}
	static PARAM_CALLBACK_requestCompile(node: CodeJsNode) {
		node.compile({triggerFunctionNode: true});
	}
}
