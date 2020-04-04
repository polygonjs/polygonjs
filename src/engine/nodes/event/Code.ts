import {TypedEventNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {AsyncFunction} from '../../../core/AsyncFunction';
const DEFAULT_FUNCTION_CODE = `
import {BaseMouseEventProcessor, BaseCameraObjNodeType} from 'polygonjs-engine'
export class EventProcessor extends BaseMouseEventProcessor {
	initialize_processor(){
	}
	process_mouse_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType){
		this._set_mouse_from_event_and_canvas(event, canvas);
		console.log(this.node.scene.time);
		console.log("processing event", this.mouse.x, this.mouse.y);
	}
}




`;
import {StringParamLanguage} from '../../params/utils/OptionsController';

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';

import {Vector2} from 'three/src/math/Vector2';
import {Raycaster} from 'three/src/core/Raycaster';
import * as THREE from 'three';
export class BaseMouseEventProcessor {
	// it looks like I still need to import raycaster and vector2 without the three namespace
	// otherwise they are seen as 'any' in the editor
	protected raycaster = new Raycaster();
	protected mouse = new Vector2();
	constructor(protected node: CodeEventNode) {
		this.initialize_processor();
	}
	process_event(event: Event, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {
		if (event instanceof MouseEvent) {
			this.process_mouse_event(event, canvas, camera_node);
		} else if (event instanceof KeyboardEvent) {
			this.process_keyboard_event(event, canvas, camera_node);
		}
	}
	process_mouse_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {}
	process_keyboard_event(event: KeyboardEvent, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {}
	set_node(node: CodeEventNode) {
		this.node = node;
	}
	initialize_processor() {}
	protected _set_mouse_from_event_and_canvas(event: MouseEvent, canvas: HTMLCanvasElement) {
		this.mouse.x = (event.offsetX / canvas.offsetWidth) * 2 - 1;
		this.mouse.y = -(event.offsetY / canvas.offsetHeight) * 2 + 1;
	}
}

type EvaluatedFunction = (
	base_event_processor_class: typeof BaseMouseEventProcessor,
	THREE: any
) => typeof BaseMouseEventProcessor | undefined;

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
	private _processor: BaseMouseEventProcessor | undefined;

	static type() {
		return 'code';
	}
	initialize_node() {
		// TODO: do not use GL connection Types here
		this.io.inputs.set_named_input_connection_points([
			new TypedNamedConnectionPoint('trigger', ConnectionPointType.BOOL),
		]);
	}

	process_event(event: Event, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {
		this._compile_if_required();

		if (this._processor) {
			this._processor.process_event(event, canvas, camera_node);
		}
	}
	private _compile_if_required() {
		if (!this._processor || this._last_compiled_code != this.pv.code_javascript) {
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
			console.log('function_body');
			console.log(function_body);
			const processor_creator_function: EvaluatedFunction = new AsyncFunction(
				'BaseMouseEventProcessor',
				'THREE',
				function_body
			);
			const processor_class = processor_creator_function(BaseMouseEventProcessor, THREE);
			if (processor_class) {
				this._processor = new processor_class(this);
				this._last_compiled_code = this.pv.code_javascript;
			} else {
				this.states.error.set(`cannot generate function`);
				this._processor = undefined;
			}
		} catch (e) {
			console.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
			this._processor = undefined;
		}
	}
}
