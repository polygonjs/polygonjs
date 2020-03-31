import {TypedEventNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {AsyncFunction} from '../../../core/AsyncFunction';
const DEFAULT_FUNCTION_CODE = `import {BaseMouseEventProcessor} from 'BaseMouseEventProcessor'
export class EventProcessor extends BaseMouseEventProcessor {
	constructor(){
	}
	process_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: any){
		this._set_mouse_from_event_and_canvas(event, canvas)
		console.log("processing event", this.mouse.x, this.mouse.y);
	}
}




`;
import {StringParamLanguage} from '../../params/utils/OptionsController';
import * as THREE from 'three';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';

import {Vector2} from 'three/src/math/Vector2';
import {Raycaster} from 'three/src/core/Raycaster';
class BaseMouseEventProcessor {
	protected node!: CodeEventNode;
	protected raycaster = new Raycaster();
	protected mouse = new Vector2();
	constructor() {}
	process_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {}
	set_node(node: CodeEventNode) {
		this.node = node;
	}
	protected _set_mouse_from_event_and_canvas(event: MouseEvent, canvas: HTMLCanvasElement) {
		this.mouse.x = (event.clientX / canvas.offsetWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / canvas.offsetHeight) * 2 + 1;
	}
}

type EvaluatedFunction = (
	node: CodeEventNode,
	base_event_processor_class: typeof BaseMouseEventProcessor,
	THREE: any
) => typeof BaseMouseEventProcessor;

class CodeEventParamsConfig extends NodeParamsConfig {
	code_typescript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE, {
		label: false,
		language: StringParamLanguage.TYPESCRIPT,
	});
	code_javascript = ParamConfig.STRING('', {hidden: true});
}
const ParamsConfig = new CodeEventParamsConfig();

export class CodeEventNode extends TypedEventNode<CodeEventParamsConfig> {
	params_config = ParamsConfig;

	private _last_compiled_code: string | undefined;
	private _event_processor: BaseMouseEventProcessor | undefined;

	static type() {
		return 'code';
	}
	initialize_node() {
		// TODO: do not use GL connection Types here
		this.io.inputs.set_named_input_connection_points([
			new TypedNamedConnectionPoint('trigger', ConnectionPointType.BOOL),
		]);
	}

	process_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {
		this._compile_if_required();

		if (this._event_processor) {
			this._event_processor.process_event(event, canvas, camera_node);
		}
	}
	private _compile_if_required() {
		if (!this._event_processor || this._last_compiled_code != this.pv.code_javascript) {
			this._compile();
		}
	}
	private _compile() {
		try {
			const function_body = `try {
				${TranspiledFilter.filter(this.pv.code_javascript)}
			} catch(e) {
				this.states.error.set(e)
			}`;
			const event_processor_creator_function: EvaluatedFunction = new AsyncFunction(
				'node',
				'BaseMouseEventProcessor',
				'THREE',
				function_body
			);
			const event_processor_class = event_processor_creator_function(this, BaseMouseEventProcessor, THREE);
			this._event_processor = new event_processor_class();
			this._event_processor.set_node(this);
			this._last_compiled_code = this.pv.code_javascript;
		} catch (e) {
			console.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
			this._event_processor = undefined;
		}
	}
}
