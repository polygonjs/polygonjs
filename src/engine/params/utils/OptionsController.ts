import {BaseParamType} from '../_Base';
import {BaseNodeType} from 'src/engine/nodes/_Base';
import lodash_compact from 'lodash/compact';
import lodash_cloneDeep from 'lodash/cloneDeep';
import lodash_isEqual from 'lodash/isEqual';
import {ParamType} from 'src/engine/poly/ParamType';
import {ParamEvent} from 'src/engine/poly/ParamEvent';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {CoreGraphNode} from 'src/core/graph/CoreGraphNode';

const ALWAYS_REFERENCE_ASSET_OPTION = 'always_reference_asset';
const CALLBACK_OPTION = 'callback';
const CALLBACK_STRING_OPTION = 'callback_string';
// const COLOR_OPTION = 'color';
const COOK_OPTION = 'cook';
const DESKTOP_BROWSE_OPTION = 'desktop_browse';
const FILE_TYPE_OPTION = 'file_type';
// const EXPRESSION_ONLY_OPTION = 'expression_only';
const EXPRESSION = 'expression';
const FOR_ENTITIES = 'for_entities';
const LEVEL = 'level';
const MENU = 'menu';
const ENTRIES = 'entries';
// const TYPE = 'type';
// const RADIO = 'radio';
const MULTILINE_OPTION = 'multiline';
const NODE_SELECTION = 'node_selection';
const NODE_SELECTION_CONTEXT = 'context';
const DEPENDENT_ON_FOUND_NODE = 'dependent_on_found_node';
const RANGE_OPTION = 'range';
const RANGE_LOCKED_OPTION = 'range_locked';
const STEP_OPTION = 'step';
const SPARE_OPTION = 'spare';
const TEXTURE_OPTION = 'texture';
const ENV_OPTION = 'env';
const HIDDEN_OPTION = 'hidden';
const LABEL_OPTION = 'label';
const FIELD_OPTION = 'field';
const VISIBLE_IF_OPTION = 'visible_if';

export interface ParamOptionsMenuEntry {
	name: string;
	value: number;
}

interface BaseParamOptions {
	// cook
	cook?: boolean;
	// spare
	spare?: boolean;
	// visible
	hidden?: boolean;
	label?: boolean;
	field?: boolean;
	visible_if?: Dictionary<number | boolean>;
}
interface MenuParamOptions {
	menu?: {
		// type: 'radio';
		entries: ParamOptionsMenuEntry[];
	};
}
interface ExpressionParamOptions {
	expression?: {
		for_entities?: boolean;
	};
}

interface NumberParamOptions extends BaseParamOptions {
	range?: Number2;
	range_locked?: Boolean2;
	step?: number;
}
interface AssetParamOptions {
	always_reference_asset?: boolean;
}
interface DesktopParamOptions {
	desktop_browse?: Dictionary<string>;
}

// actual param options
export interface BooleanParamOptions extends BaseParamOptions, MenuParamOptions, ExpressionParamOptions {}
export interface ButtonParamOptions extends BaseParamOptions {
	callback?: (node: BaseNodeType, param: BaseParamType) => any;
	callback_string?: string;
}
export interface ColorParamOptions extends BaseParamOptions, ExpressionParamOptions {}
export interface FloatParamOptions extends NumberParamOptions, MenuParamOptions, ExpressionParamOptions {}
export interface FolderParamOptions extends BaseParamOptions {
	level?: number;
}
export interface IntegerParamOptions extends NumberParamOptions, MenuParamOptions {}
export interface OperatorPathParamOptions extends BaseParamOptions, DesktopParamOptions {
	node_selection?: {
		context?: NodeContext;
	};
	dependent_on_found_node?: boolean;
}
export interface RampParamOptions extends BaseParamOptions {}
export interface SeparatorParamOptions extends BaseParamOptions {}
export interface StringParamOptions
	extends BaseParamOptions,
		AssetParamOptions,
		DesktopParamOptions,
		ExpressionParamOptions {
	multiline?: boolean;
}
export interface Vector2ParamOptions extends BaseParamOptions, ExpressionParamOptions {}
export interface Vector3ParamOptions extends BaseParamOptions, ExpressionParamOptions {}
export interface Vector4ParamOptions extends BaseParamOptions, ExpressionParamOptions {}

export interface ParamOptions
	extends NumberParamOptions,
		FolderParamOptions,
		ExpressionParamOptions,
		ButtonParamOptions,
		DesktopParamOptions,
		MenuParamOptions,
		StringParamOptions,
		OperatorPathParamOptions {
	// asset refererences
	// always_reference_asset?: boolean;
	// callback
	// callback?: (node: BaseNodeType, param: BaseParamType) => any;
	// callback_string?: string;
	// color
	// color?: [number, number, number] | string;
	// cook
	// cook?: boolean;
	// desktop
	// desktop_browse?: Dictionary<string>;
	// expression
	// expression_only?: boolean;
	// expression?: {
	// 	for_entities?: boolean;
	// };
	// folder
	// level?:number
	// menu
	// menu?: {
	// 	// type: 'radio';
	// 	entries: ParamOptionsMenuEntry[];
	// };
	// multiline
	// multiline?: boolean;
	// node selection
	// node_selection?: {
	// 	context?: NodeContext;
	// };
	// dependent_on_found_node?: boolean;
	// spare
	// spare?: boolean;
	// texture
	texture?: {
		env?: boolean;
	};
	// visible
	// hidden?: boolean;
	// label?: boolean;
	// field?: boolean;
	// visible_if?: Dictionary<number | boolean>;
}

export class OptionsController {
	private _programatic_visible_state: boolean = true;
	private _options!: ParamOptions;
	private _default_options!: ParamOptions;
	constructor(private _param: BaseParamType) {
		// this._options = lodash_cloneDeep(this._default_options);
	}

	set(options: ParamOptions) {
		this._default_options = options;
		this._options = lodash_cloneDeep(this._default_options);
	}
	copy(options_controller: OptionsController) {
		this._default_options = lodash_cloneDeep(options_controller.default);
		this._options = lodash_cloneDeep(options_controller.current);
	}
	set_option(name: keyof ParamOptions, value: any) {
		return Object.assign(this._options, name, value);
	}
	get param() {
		return this._param;
	}
	get node(): BaseNodeType {
		return this._param.node;
	}
	get default() {
		return this._default_options;
	}
	get current() {
		return this._options;
	}

	// utils
	get has_options_overridden(): boolean {
		return !lodash_isEqual(this._options, this._default_options);
	}
	get overridden_options(): ParamOptions {
		const overriden: ParamOptions = {};
		const option_names = Object.keys(this._options) as Array<keyof ParamOptions>;
		for (let option_name of option_names) {
			if (!lodash_isEqual(this._options[option_name], this._default_options[option_name])) {
				Object.assign(overriden, option_name, lodash_cloneDeep(this._options[option_name]));
			}
		}
		return overriden;
	}
	get overridden_option_names(): Array<keyof ParamOptions> {
		return Object.keys(this.overridden_options) as Array<keyof ParamOptions>;
	}

	// referenced assets
	get always_reference_asset(): boolean {
		return this._options[ALWAYS_REFERENCE_ASSET_OPTION] || false;
	}

	// callback
	has_callback() {
		return this._options[CALLBACK_OPTION] != null || this._options[CALLBACK_STRING_OPTION] != null;
	}

	execute_callback() {
		const callback = this.get_callback();
		if (callback != null) {
			if (this.node && !this.node.cook_controller.is_cooking) {
				callback(this.node, this.param);
			}
		}
	}
	private get_callback() {
		if (this.has_callback()) {
			return (this._options[CALLBACK_OPTION] =
				this._options[CALLBACK_OPTION] || this.create_callback_from_string());
		}
	}
	private create_callback_from_string() {
		const callback_string = this._options[CALLBACK_STRING_OPTION];
		if (callback_string) {
			const callback_function = new Function('node', 'scene', 'window', 'location', callback_string);
			return () => {
				callback_function(this.node, this.node.scene, null, null);
			};
		}
	}

	// color
	// color() {
	// 	return this._options[COLOR_OPTION];
	// }

	// cook
	makes_node_dirty_when_dirty() {
		let cook_options;

		// false as the dirty state will go through the parent param
		if (this.param.parent_param != null) {
			return false;
		}

		let value = true;
		if ((cook_options = this._options[COOK_OPTION]) != null) {
			value = cook_options;
		}
		return value;
	}

	// desktop
	get desktop_browse_option() {
		return this._options[DESKTOP_BROWSE_OPTION];
	}
	get desktop_browse_allowed(): boolean {
		return this.desktop_browse_option != null;
	}
	desktop_browse_file_type(): string | null {
		if (this.desktop_browse_option) {
			return this.desktop_browse_option[FILE_TYPE_OPTION];
		} else {
			return null;
		}
	}

	// expression
	// get displays_expression_only() {
	// 	return this._options[EXPRESSION_ONLY_OPTION] === true;
	// }
	get is_expression_for_entities(): boolean {
		const expr_option = this._options[EXPRESSION];
		if (expr_option) {
			return expr_option[FOR_ENTITIES] || false;
		}
		return false;
	}

	// folder
	get level() {
		return this._options[LEVEL] || 0;
	}

	// menu
	get has_menu() {
		return this.menu_options != null;
	}

	private get menu_options() {
		return this._options[MENU];
	}
	// private get menu_type() {
	// 	if(this.menu_options){
	// 		return this.menu_options[TYPE];
	// 	}
	// }

	get menu_entries() {
		if (this.menu_options) {
			return this.menu_options[ENTRIES];
		} else {
			return [];
		}
	}

	get has_menu_radio() {
		return this.has_menu; //&& this.menu_options[TYPE] === RADIO;
	}

	// multiline
	get is_multiline(): boolean {
		return this._options[MULTILINE_OPTION] === true;
	}

	// node selection
	get node_selection_options() {
		return this._options[NODE_SELECTION];
	}
	get node_selection_context() {
		if (this.node_selection_options) {
			return this.node_selection_options[NODE_SELECTION_CONTEXT];
		}
	}

	dependent_on_found_node() {
		if (DEPENDENT_ON_FOUND_NODE in this._options) {
			return this._options[DEPENDENT_ON_FOUND_NODE];
		} else {
			return true;
		}
	}

	// range
	get range(): Number2 {
		// cannot force range easily, as values are not necessarily from 0 to N
		// if(this.self.has_menu() && this.self.menu_entries()){
		// 	return [0, this.self.menu_entries().length-1 ]
		// } else {
		return this._options[RANGE_OPTION] || [0, 1];
		// }
	}
	get step(): number {
		return this._options[STEP_OPTION] || 0.01;
	}

	private range_locked(): Boolean2 {
		// if(this.self.has_menu() && this.self.menu_entries()){
		// 	return [true, true]
		// } else {
		return this._options[RANGE_LOCKED_OPTION] || [false, false];
		// }
	}

	protected _ensure_in_range(value: number): number {
		const range = this.range;

		if (value >= range[0] && value <= range[1]) {
			return value;
		} else {
			if (value < range[0]) {
				return this.range_locked()[0] === true ? range[0] : value;
			} else {
				return this.range_locked()[1] === true ? range[1] : value;
			}
		}
	}

	// spare
	get is_spare(): boolean {
		return this._options[SPARE_OPTION] || false;
	}

	// texture
	get texture_options() {
		return this._options[TEXTURE_OPTION];
	}
	texture_as_env(): boolean {
		const texture_options = this.texture_options;
		if (texture_options != null) {
			return texture_options[ENV_OPTION] === true;
		}
		return false;
	}

	// visible
	get is_hidden(): boolean {
		return this._options[HIDDEN_OPTION] === true || this._programatic_visible_state === false;
	}
	get is_visible(): boolean {
		return !this.is_hidden;
	}
	set_visible_state(state: boolean) {
		this._options[HIDDEN_OPTION] = !state;
		this.param.emit(ParamEvent.VISIBLE_UPDATED);
	}

	get is_label_hidden(): boolean {
		const type = this.param.type;
		return (
			this._options[LABEL_OPTION] === false ||
			type === ParamType.BUTTON ||
			type === ParamType.SEPARATOR ||
			(type === ParamType.BOOLEAN && this.is_field_hidden())
		);
	}
	is_field_hidden(): boolean {
		return this._options[FIELD_OPTION] === false;
	}

	// programatic visibility
	ui_data_depends_on_other_params(): boolean {
		return VISIBLE_IF_OPTION in this._options;
	}
	visibility_predecessors() {
		const predecessor_names = Object.keys(this._options[VISIBLE_IF_OPTION] || {});
		const node = this.param.node;
		return lodash_compact(
			predecessor_names.map((name) => {
				const param = node.params.get(name);
				if (param) {
					return param;
				} else {
					console.error(
						`param ${name} not found as visibility condition for ${this.param.name} in node ${this.param.node.type}`
					);
				}
			})
		);
	}

	private _update_visibility_and_remove_dirty_bound = this.update_visibility_and_remove_dirty.bind(this);
	private _visibility_graph_node: CoreGraphNode | undefined;
	private _ui_data_dependency_set: boolean = false;
	set_ui_data_dependency() {
		if (this._ui_data_dependency_set) {
			return;
		}
		this._ui_data_dependency_set = true;
		const predecessors = this.visibility_predecessors();
		if (predecessors.length > 0) {
			this._visibility_graph_node = new CoreGraphNode(this.param.scene, 'param_visibility');
			for (let predecessor of predecessors) {
				this._visibility_graph_node.add_graph_input(predecessor);
			}
			this._visibility_graph_node.add_post_dirty_hook(
				'_update_visibility_and_remove_dirty',
				this._update_visibility_and_remove_dirty_bound
			);
		}
	}
	private update_visibility_and_remove_dirty() {
		this.update_visibility();
		this.param.remove_dirty_state();
	}

	async update_visibility() {
		const options = this._options[VISIBLE_IF_OPTION];
		if (options) {
			const params = this.visibility_predecessors();
			const promises = params.map((p) => p.compute());
			this._programatic_visible_state = true;
			await Promise.all(promises);
			for (let param of params) {
				const expected_val = options[param.name];
				const val = param.value;
				if (expected_val != val) {
					this._programatic_visible_state = false;
				}
			}
			this.param.emit(ParamEvent.VISIBLE_UPDATED);
		}
	}
}
