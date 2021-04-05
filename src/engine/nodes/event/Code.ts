// import {TypedEventNode} from './_Base';
// import {EventContext} from '../../scene/utils/events/_BaseEventsController';
// import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
// import {Poly} from '../../Poly';
// import {StringParamLanguage} from '../../params/utils/OptionsController';
// import {TranspiledFilter} from '../utils/code/controllers/TranspiledFilter';
// import {Vector2} from 'three/src/math/Vector2';
// import {Raycaster} from 'three/src/core/Raycaster';
// import * as THREE from 'three'; // three import required to give to the function builder

// const DEFAULT_FUNCTION_CODE = `
// import {BaseCodeEventProcessor, EventContext} from 'polygonjs-engine'
// export class EventProcessor extends BaseCodeEventProcessor {
// 	initialize_processor(){
// 	}
// 	process_mouse_event(event_context: EventContext<MouseEvent>){
// 		this._set_mouse_from_event_and_canvas(event_context.event, event_context.canvas);
// 		console.log(this.node.scene.time);
// 		console.log("processing event", this.mouse.x, this.mouse.y);
// 	}
// }

// `;
// export class BaseCodeEventProcessor {
// 	// it looks like I still need to import raycaster and vector2 without the three namespace
// 	// otherwise they are seen as 'any' in the editor
// 	protected raycaster = new Raycaster();
// 	protected mouse = new Vector2();
// 	constructor(protected node: CodeEventNode) {
// 		this.initialize_processor();
// 	}
// 	process_event(event_context: EventContext<Event>) {
// 		if (event_context.event instanceof MouseEvent) {
// 			this.process_mouse_event(event_context as EventContext<MouseEvent>);
// 		} else if (event instanceof KeyboardEvent) {
// 			this.process_keyboard_event(event_context as EventContext<KeyboardEvent>);
// 		}
// 	}
// 	process_mouse_event(event_context: EventContext<MouseEvent>) {}
// 	process_keyboard_event(event_context: EventContext<KeyboardEvent>) {}
// 	set_node(node: CodeEventNode) {
// 		this.node = node;
// 	}
// 	initialize_processor() {}
// 	protected _set_mouse_from_event_and_canvas(event: MouseEvent, canvas: HTMLCanvasElement) {
// 		this.mouse.x = (event.offsetX / canvas.offsetWidth) * 2 - 1;
// 		this.mouse.y = -(event.offsetY / canvas.offsetHeight) * 2 + 1;
// 	}
// }

// // type EvaluatedFunction = (
// // 	base_event_processor_class: typeof BaseCodeEventProcessor,
// // 	THREE: any
// // ) => typeof BaseCodeEventProcessor | undefined;
// import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
// class CodeEventParamsConfig extends NodeParamsConfig {
// 	code_typescript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE, {
// 		// show_label: false,
// 		language: StringParamLanguage.TYPESCRIPT,
// 	});
// 	code_javascript = ParamConfig.STRING('', {hidden: true});
// }
// const ParamsConfig = new CodeEventParamsConfig();

// export class CodeEventNode extends TypedEventNode<CodeEventParamsConfig> {
// 	paramsConfig = ParamsConfig;

// 	private _last_compiled_code: string | undefined;
// 	private _processor: BaseCodeEventProcessor | undefined;

// 	static type() {
// 		return 'code';
// 	}
// 	initializeNode() {
// 		this.io.inputs.setNamedInputConnectionPoints([
// 			new EventConnectionPoint('trigger', EventConnectionPointType.BASE),
// 		]);
// 	}

// 	process_event(event_context: EventContext<Event>) {
// 		this._compileIfRequired();

// 		if (this._processor) {
// 			this._processor.process_event(event_context);
// 		}
// 	}
// 	private _compileIfRequired() {
// 		if (!this._processor || this._last_compiled_code != this.pv.code_javascript) {
// 			this._compile();
// 		}
// 	}
// 	private _compile() {
// 		try {
// 			const function_body = `try {
// 				${TranspiledFilter.filter(this.pv.code_javascript)}
// 			} catch(e) {
// 				this.states.error.set(e)
// 			}`;
// 			const processor_creator_function: Function = new Function('BaseCodeEventProcessor', 'THREE', function_body);
// 			const processor_class: typeof BaseCodeEventProcessor | undefined = processor_creator_function(
// 				BaseCodeEventProcessor,
// 				THREE
// 			);
// 			if (processor_class) {
// 				this._processor = new processor_class(this);
// 				this._last_compiled_code = this.pv.code_javascript;
// 			} else {
// 				this.states.error.set(`cannot generate function`);
// 				this._processor = undefined;
// 			}
// 		} catch (e) {
// 			Poly.warn(e);
// 			this.states.error.set(`cannot generate function (${e})`);
// 			this._processor = undefined;
// 		}
// 	}
// }
