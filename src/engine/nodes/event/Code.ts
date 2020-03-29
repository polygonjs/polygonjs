import {TypedEventNode} from './_Base';
import {TypedNamedConnectionPoint} from '../utils/connections/NamedConnectionPoint';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {AsyncFunction} from '../../../core/AsyncFunction';
const DEFAULT_FUNCTION_CODE = `class EventProcessor {
	private raycaster = new THREE.Raycaster();
	private mouse = new THREE.Vector2();
	constructor(){
	}
	process_event(event: MouseEvent, canvas: HTMLCanvasElement, camera_node: any){
		this.mouse.x = ( event.clientX / canvas.offsetWidth ) * 2 - 1;
		this.mouse.y = - ( event.clientY / canvas.offsetHeight ) * 2 + 1;
		console.log("processing event", this.mouse.x, this.mouse.y);
	}
}




`;
import {StringParamLanguage} from '../../params/utils/OptionsController';
import {PolyScene} from '../../scene/PolyScene';
import * as THREE from 'three';

class EventProcessor {
	constructor() {}
	process_event(event: Event, canvas: HTMLCanvasElement, camera_node: BaseCameraObjNodeType) {}
}
// type EvaluatedFunction = (node: CodeEventNode, scene: PolyScene, event: Event, THREE: any) => void;
type EvaluatedFunction = (node: CodeEventNode, scene: PolyScene, THREE: any) => typeof EventProcessor;

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
class CodeEventParamsConfig extends NodeParamsConfig {
	code = ParamConfig.STRING(DEFAULT_FUNCTION_CODE, {
		label: false,
		language: StringParamLanguage.TYPESCRIPT,
	});
	code_transpiled = ParamConfig.STRING('', {hidden: true});
}
const ParamsConfig = new CodeEventParamsConfig();

export class CodeEventNode extends TypedEventNode<CodeEventParamsConfig> {
	params_config = ParamsConfig;

	private _last_compiled_code: string | undefined;
	// private _function: EvaluatedFunction | undefined;
	private _event_processor: EventProcessor | undefined;

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
		if (!this._event_processor || this._last_compiled_code != this.pv.code_transpiled) {
			this._compile();
		}
	}
	private _compile() {
		try {
			const function_body = `try {
				return ${this.pv.code_transpiled}
			} catch(e) {
				this.states.error.set(e)
			}`;
			const event_processor_creator_function: EvaluatedFunction = new AsyncFunction(
				'node',
				'scene',
				'THREE',
				function_body
			);
			const event_processor_class = event_processor_creator_function(this, this.scene, THREE);
			this._event_processor = new event_processor_class();
			this._last_compiled_code = this.pv.code_transpiled;
		} catch (e) {
			console.warn(e);
			this.states.error.set(`cannot generate function (${e})`);
			this._event_processor = undefined;
		}
	}
}
