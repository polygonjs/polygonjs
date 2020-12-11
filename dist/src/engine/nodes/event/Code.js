import {TypedEventNode} from "./_Base";
import {EventConnectionPoint, EventConnectionPointType} from "../utils/io/connections/Event";
import {Poly as Poly2} from "../../Poly";
import {StringParamLanguage} from "../../params/utils/OptionsController";
import {TranspiledFilter as TranspiledFilter2} from "../utils/code/controllers/TranspiledFilter";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {Raycaster as Raycaster2} from "three/src/core/Raycaster";
import * as THREE from "three";
const DEFAULT_FUNCTION_CODE = `
import {BaseCodeEventProcessor, EventContext} from 'polygonjs-engine'
export class EventProcessor extends BaseCodeEventProcessor {
	initialize_processor(){
	}
	process_mouse_event(event_context: EventContext<MouseEvent>){
		this._set_mouse_from_event_and_canvas(event_context.event, event_context.canvas);
		console.log(this.node.scene.time);
		console.log("processing event", this.mouse.x, this.mouse.y);
	}
}




`;
export class BaseCodeEventProcessor {
  constructor(node) {
    this.node = node;
    this.raycaster = new Raycaster2();
    this.mouse = new Vector22();
    this.initialize_processor();
  }
  process_event(event_context) {
    if (event_context.event instanceof MouseEvent) {
      this.process_mouse_event(event_context);
    } else if (event instanceof KeyboardEvent) {
      this.process_keyboard_event(event_context);
    }
  }
  process_mouse_event(event_context) {
  }
  process_keyboard_event(event_context) {
  }
  set_node(node) {
    this.node = node;
  }
  initialize_processor() {
  }
  _set_mouse_from_event_and_canvas(event2, canvas) {
    this.mouse.x = event2.offsetX / canvas.offsetWidth * 2 - 1;
    this.mouse.y = -(event2.offsetY / canvas.offsetHeight) * 2 + 1;
  }
}
import {NodeParamsConfig, ParamConfig} from "../utils/params/ParamsConfig";
class CodeEventParamsConfig extends NodeParamsConfig {
  constructor() {
    super(...arguments);
    this.code_typescript = ParamConfig.STRING(DEFAULT_FUNCTION_CODE, {
      show_label: false,
      language: StringParamLanguage.TYPESCRIPT
    });
    this.code_javascript = ParamConfig.STRING("", {hidden: true});
  }
}
const ParamsConfig2 = new CodeEventParamsConfig();
export class CodeEventNode extends TypedEventNode {
  constructor() {
    super(...arguments);
    this.params_config = ParamsConfig2;
  }
  static type() {
    return "code";
  }
  initialize_node() {
    this.io.inputs.set_named_input_connection_points([
      new EventConnectionPoint("trigger", EventConnectionPointType.BASE)
    ]);
  }
  process_event(event_context) {
    this._compile_if_required();
    if (this._processor) {
      this._processor.process_event(event_context);
    }
  }
  _compile_if_required() {
    if (!this._processor || this._last_compiled_code != this.pv.code_javascript) {
      this._compile();
    }
  }
  _compile() {
    try {
      const function_body = `try {
				${TranspiledFilter2.filter(this.pv.code_javascript)}
			} catch(e) {
				this.states.error.set(e)
			}`;
      const processor_creator_function = new Function("BaseCodeEventProcessor", "THREE", function_body);
      const processor_class = processor_creator_function(BaseCodeEventProcessor, THREE);
      if (processor_class) {
        this._processor = new processor_class(this);
        this._last_compiled_code = this.pv.code_javascript;
      } else {
        this.states.error.set(`cannot generate function`);
        this._processor = void 0;
      }
    } catch (e) {
      Poly2.warn(e);
      this.states.error.set(`cannot generate function (${e})`);
      this._processor = void 0;
    }
  }
}
