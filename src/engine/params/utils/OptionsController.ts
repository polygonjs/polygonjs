import {BaseParamType} from '../_Base';
import {BaseNodeType} from '../../nodes/_Base';
import {ParamType} from '../../poly/ParamType';
import {ParamEvent} from '../../poly/ParamEvent';
import {NodeContext} from '../../poly/NodeContext';
import {CoreGraphNode} from '../../../core/graph/CoreGraphNode';
import {ColorConversion} from '../../../core/Color';
import {CoreType, isFunction} from '../../../core/Type';
import {arrayDifference, arrayCompact, arrayUniq} from '../../../core/ArrayUtils';
import {objectCloneDeep, objectIsEqual} from '../../../core/ObjectUtils';
import {PolyScene} from '../../scene/PolyScene';
import {Boolean2, Number2, PolyDictionary} from '../../../types/GlobalTypes';

const CALLBACK_OPTION = 'callback';
const CALLBACK_STRING_OPTION = 'callbackString';
// const COLOR_OPTION = 'color';
const COMPUTE_ON_DIRTY = 'computeOnDirty';
const COOK_OPTION = 'cook';
const FILE_BROWSE_OPTION = 'fileBrowse';
const FILE_BROWSE_EXTENSIONS = 'extensions';
// const EXPRESSION_ONLY_OPTION = 'expression_only';
const EXPRESSION = 'expression';
const FOR_ENTITIES = 'forEntities';
const LABEL = 'label';
const HIDE_LABEL = 'hideLabel';
const LEVEL = 'level';
const MENU = 'menu';
const MENU_STRING = 'menuString';
const ENTRIES = 'entries';
// const TYPE = 'type';
// const RADIO = 'radio';
const MULTILINE_OPTION = 'multiline';
const LANGUAGE_OPTION = 'language';
const NODE_SELECTION = 'nodeSelection';
const NODE_SELECTION_CONTEXT = 'context';
const NODE_SELECTION_TYPES = 'types';
const OBJECT_MASK = 'objectMask';
const OBJECT_MASK_INPUT_INDEX = 'inputIndex';
// const PARAM_SELECTION = 'paramSelection';
const DEPENDENT_ON_FOUND_NODE = 'dependentOnFoundNode';
const DEPENDENT_ON_FOUND_PARAM = 'dependentOnFoundParam';
const RANGE_OPTION = 'range';
const RANGE_LOCKED_OPTION = 'rangeLocked';
const STEP_OPTION = 'step';
const SPARE_OPTION = 'spare';
const TEXTURE_OPTION = 'texture';
const ENV_OPTION = 'env';
const HIDDEN_OPTION = 'hidden';
// const SHOW_LABEL_OPTION = 'show_label';
const FIELD_OPTION = 'field';
const VISIBLE_IF_OPTION = 'visibleIf';
const COLOR_CONVERSION = 'conversion';

const SEPARATOR_BEFORE_OPTION = 'separatorBefore';
const SEPARATOR_AFTER_OPTION = 'separatorAfter';
const JOIN_TO_PREVIOUS_PARAM = 'joinToPreviousParam';
const AS_QUATERNION = 'asQuaternion';

export const PARAM_OPTION_NAMES = {
	CALLBACK_OPTION,
};

const EDITABLE = 'editable';

export interface GenericParamOptionsMenuEntry<T> {
	name: string;
	value: T;
}
export type StringParamOptionsMenuEntry = GenericParamOptionsMenuEntry<string>;
export type NumericParamOptionsMenuEntry = GenericParamOptionsMenuEntry<number>;

export interface MenuNumericParamOptions {
	menu?: {
		entries: NumericParamOptionsMenuEntry[];
	};
}
export interface MenuStringParamOptions {
	menuString?: {
		entries: StringParamOptionsMenuEntry[];
	};
}
export enum StringParamLanguage {
	// JAVASCRIPT = 'javascript',
	CSS = 'css',
	GLSL = 'glsl',
	HTML = 'html',
	TYPESCRIPT = 'typescript',
	JSON = 'json',
	// GLSL = 'glsl',
}

export enum FileType {
	AUDIO = 'audio',
	TEXTURE_IMAGE = 'texture_image',
	TEXTURE_VIDEO = 'texture_video',
	GEOMETRY = 'geometry',
	FONT = 'font',
	SVG = 'svg',
	JSON = 'json',
}

export type VisibleIfParamOptions = PolyDictionary<number | boolean | string>;
export interface BaseParamOptions {
	// cook
	cook?: boolean;
	// spare
	spare?: boolean;
	// visible
	hidden?: boolean;
	// show_label?: boolean;
	field?: boolean;
	visibleIf?: VisibleIfParamOptions | VisibleIfParamOptions[];
	// separator
	separatorBefore?: boolean;
	separatorAfter?: boolean;
	joinToPreviousParam?: boolean;
	// editable
	editable?: boolean;
}

interface ExpressionParamOptions {
	expression?: {
		forEntities?: boolean;
	};
}

interface NumberParamOptions extends BaseParamOptions {
	range?: Number2;
	rangeLocked?: Boolean2;
	step?: number;
}

interface FileParamOptions {
	fileBrowse?: {
		extensions: string[];
	};
}
interface ComputeOnDirtyParamOptions {
	computeOnDirty?: boolean;
}
interface CallbackParamOptions {
	callback?: (node: BaseNodeType, param: BaseParamType) => any;
	callbackString?: string;
}
interface LabelParamOptions {
	label?: string;
}
interface LabelVisibilityParamOptions {
	hideLabel?: boolean;
}
interface ColorConversionOptions {
	conversion?: ColorConversion;
}

// actual param options
export interface BooleanParamOptions
	extends BaseParamOptions,
		ComputeOnDirtyParamOptions,
		MenuNumericParamOptions,
		ExpressionParamOptions,
		CallbackParamOptions,
		LabelParamOptions {}
export interface ButtonParamOptions extends BaseParamOptions, CallbackParamOptions, LabelParamOptions {}
export interface ColorParamOptions
	extends BaseParamOptions,
		LabelParamOptions,
		ColorConversionOptions,
		ExpressionParamOptions,
		CallbackParamOptions,
		ComputeOnDirtyParamOptions {}
export interface FloatParamOptions
	extends NumberParamOptions,
		MenuNumericParamOptions,
		ComputeOnDirtyParamOptions,
		ExpressionParamOptions,
		CallbackParamOptions {}
export interface FolderParamOptions extends BaseParamOptions {
	level?: number;
}
interface ObjectMask {
	inputIndex?: number;
	fromInputOnly?: boolean;
}
type ObjectMaskOptions = ObjectMask | boolean;
export interface IntegerParamOptions
	extends NumberParamOptions,
		MenuNumericParamOptions,
		ComputeOnDirtyParamOptions,
		ExpressionParamOptions,
		CallbackParamOptions {}
export interface NodePathParamOptions
	extends BaseParamOptions,
		FileParamOptions,
		ComputeOnDirtyParamOptions,
		CallbackParamOptions {
	nodeSelection?: {
		context?: NodeContext;
		types?: Readonly<string[]>;
	};
	dependentOnFoundNode?: boolean;
}
export interface ParamPathParamOptions
	extends BaseParamOptions,
		FileParamOptions,
		ComputeOnDirtyParamOptions,
		CallbackParamOptions {
	dependentOnFoundParam?: boolean;
	paramSelection?: ParamType | boolean;
}
export interface RampParamOptions extends BaseParamOptions, LabelVisibilityParamOptions {}
export interface SeparatorParamOptions extends BaseParamOptions {}
export interface StringParamOptions
	extends BaseParamOptions,
		MenuStringParamOptions,
		FileParamOptions,
		CallbackParamOptions,
		ExpressionParamOptions,
		LabelVisibilityParamOptions {
	multiline?: boolean;
	language?: StringParamLanguage;
	objectMask?: ObjectMaskOptions;
}
interface VectorParamOptions
	extends BaseParamOptions,
		LabelParamOptions,
		ExpressionParamOptions,
		CallbackParamOptions,
		ComputeOnDirtyParamOptions {}
export interface Vector2ParamOptions extends VectorParamOptions {}
export interface Vector3ParamOptions extends VectorParamOptions {}

interface QuaternionOptions {
	asQuaternion?: boolean;
}
export interface Vector4ParamOptions extends VectorParamOptions, QuaternionOptions {}

export interface ParamOptions
	extends NumberParamOptions,
		ColorConversionOptions,
		ComputeOnDirtyParamOptions,
		FolderParamOptions,
		ExpressionParamOptions,
		ButtonParamOptions,
		FileParamOptions,
		MenuNumericParamOptions,
		StringParamOptions,
		NodePathParamOptions,
		ParamPathParamOptions,
		LabelVisibilityParamOptions,
		QuaternionOptions {
	texture?: {
		env?: boolean;
	};
}

// type OptionChangeCallback = () => void;

// we don't want to check if EDITABLE has been overriden,
// as it is overriden dynamically for the gl nodes
// and that override should therefore not be saved with the scene
const NON_OVERRIDABLE_OPTIONS: Array<keyof ParamOptions> = [EDITABLE];

export class OptionsController {
	private _programaticVisibleState: boolean = true;
	private _options!: ParamOptions;
	private _default_options!: ParamOptions;
	constructor(private _param: BaseParamType) {}
	dispose() {
		try {
			// there is a bug where the _options is just a string
			// for builder params. And accessing generates an error
			this._options[CALLBACK_OPTION] = undefined;
			this._options[CALLBACK_STRING_OPTION] = undefined;
		} catch (err) {}
		this._visibility_graph_node?.dispose();
	}

	set(options: ParamOptions) {
		if (CoreType.isString(options)) {
			console.warn('options input invalid', options, typeof options);
		}
		this._default_options = options;
		this._options = objectCloneDeep(this._default_options);
		this.postSetOptions();
	}
	copy(options_controller: OptionsController) {
		this._default_options = objectCloneDeep(options_controller.default());
		this._options = objectCloneDeep(options_controller.current());
		this.postSetOptions();
	}
	setOption<K extends keyof ParamOptions>(optionName: K, value: ParamOptions[K]) {
		if (!this._validateOption(optionName, value)) {
			return;
		}

		this._options[optionName] = value;
		if (this._param.components) {
			for (const component of this._param.components) {
				component.options.setOption(optionName, value);
			}
		}
		// this._runOptionCallback(optionName);
	}

	private _validateOption<K extends keyof ParamOptions>(optionName: K, value: ParamOptions[K]) {
		if (optionName == CALLBACK_OPTION) {
			return isFunction(value);
		}
		return true;
	}

	private postSetOptions() {
		this._handleComputeOnDirty();
	}
	param() {
		return this._param;
	}
	node(): BaseNodeType {
		return this._param.node;
	}
	default() {
		return this._default_options;
	}
	current() {
		return this._options;
	}

	// utils
	hasOptionsOverridden(): boolean {
		return !objectIsEqual(this._options, this._default_options);
	}
	overriddenOptions(): ParamOptions {
		const overriden: ParamOptions = {};
		const optionNames = Object.keys(this._options) as Array<keyof ParamOptions>;
		const optionNamesToCheck: Array<keyof ParamOptions> = [];
		arrayDifference(optionNames, NON_OVERRIDABLE_OPTIONS, optionNamesToCheck);
		for (const optionName of optionNamesToCheck) {
			if (!objectIsEqual(this._options[optionName], this._default_options[optionName])) {
				const cloned_option = objectCloneDeep(this._options[optionName]);
				Object.assign(overriden, {[optionName]: cloned_option});
			}
		}
		return overriden;
	}
	overriddenOptionNames(): Array<keyof ParamOptions> {
		return Object.keys(this.overriddenOptions()) as Array<keyof ParamOptions>;
	}

	// compute on dirty
	computeOnDirty(): boolean {
		return this._options[COMPUTE_ON_DIRTY] || false;
	}
	private _computeOnDirtyCallbackAdded: boolean | undefined;
	private _handleComputeOnDirty() {
		if (this.computeOnDirty()) {
			if (!this._computeOnDirtyCallbackAdded) {
				this.param().addPostDirtyHook('computeOnDirty', this._computeParam.bind(this));
				this._computeOnDirtyCallbackAdded = true;
			}
		}
	}
	private async _computeParam() {
		await this.param().compute();
	}

	// callback
	hasCallback() {
		return this._options[CALLBACK_OPTION] != null || this._options[CALLBACK_STRING_OPTION] != null;
	}

	private _callbackAllowed = false;
	allowCallback() {
		this._callbackAllowed = true;
	}

	async executeCallback() {
		if (!this._callbackAllowed) {
			return;
		}
		const node = this.node();
		if (!node) {
			return;
		}
		const scene = node.scene();
		if (!scene) {
			return;
		}
		const callback = this.getCallback(node, scene);
		if (!callback) {
			return;
		}
		// we only allow execution when scene is loaded
		// to avoid errors such as an operator_path param
		// executing its callback before the node it points to is created
		if (!scene.loadingController.loaded()) {
			return;
		}
		// not running the callback when a node is cooking prevents some event nodes from behaving as expected.
		// It may also prevent files such as the sop/file to reload correctly if its reload callback was called while it loads a file
		// if (!this.node.cookController.is_cooking) {
		const parentParam = this.param().parentParam();
		if (parentParam) {
			// if the param is a component of a MultipleParam,
			// we let the parent handle the callback.
			// The main reason is for material builder uniforms.
			// If the component executes the callback, the uniform that is expecting a vector
			// will be receiving a float. The reason is that the callback is created by the ParamConfig, and it is then passed down to the component unchanged.
			// I could maybe find a way so that the param config creates callback for the multiple param
			// and also for the components. But they would have to be assigned correctly by the multiple param
			parentParam.options.executeCallback();
		} else {
			await callback(node, this.param());
		}
	}
	private getCallback(node: BaseNodeType, scene: PolyScene) {
		if (this.hasCallback()) {
			return (this._options[CALLBACK_OPTION] =
				this._options[CALLBACK_OPTION] || this.createCallbackFromString(node, scene));
		}
	}
	private createCallbackFromString(node: BaseNodeType, scene: PolyScene) {
		const callbackString = this._options[CALLBACK_STRING_OPTION];
		if (callbackString) {
			const callbackFunction = new Function('node', 'scene', 'window', 'location', callbackString);
			return () => {
				callbackFunction(node, scene, null, null);
			};
		}
	}

	// color
	colorConversion() {
		return this._options[COLOR_CONVERSION] || ColorConversion.NONE;
	}

	// cook
	makesNodeDirtyWhenDirty() {
		// false as the dirty state will go through the parent param
		if (this.param().parentParam() != null) {
			return false;
		}

		const cookOptions = this._options[COOK_OPTION];
		if (cookOptions != null) {
			return cookOptions;
		}
		return true;
	}

	// desktop
	fileBrowseOption() {
		return this._options[FILE_BROWSE_OPTION];
	}
	fileBrowseAllowed(): boolean {
		return this.fileBrowseOption() != null;
	}
	fileBrowseExtensions(): string[] | null {
		const option = this.fileBrowseOption();
		if (option) {
			return option[FILE_BROWSE_EXTENSIONS];
		} else {
			return null;
		}
	}

	// separator
	separatorBefore() {
		return this._options[SEPARATOR_BEFORE_OPTION];
	}
	separatorAfter() {
		return this._options[SEPARATOR_AFTER_OPTION];
	}
	joinToPreviousParam() {
		return this._options[JOIN_TO_PREVIOUS_PARAM];
	}
	// editable
	setEditableState(state: boolean) {
		const currentState = this._options[EDITABLE];
		const param = this.param();
		if (currentState != state) {
			this._options[EDITABLE] = state;
			param.emit(ParamEvent.EDITABLE_UPDATED);
		}
		if (param.components) {
			for (const component of param.components) {
				component.options.setEditableState(state);
			}
		}
	}
	editable(): boolean {
		const state = this._options[EDITABLE];
		if (state != null) {
			return state;
		}
		return true;
	}

	// expression
	// get displays_expression_only() {
	// 	return this._options[EXPRESSION_ONLY_OPTION] === true;
	// }
	isExpressionForEntities(): boolean {
		const expr_option = this._options[EXPRESSION];
		if (expr_option) {
			return expr_option[FOR_ENTITIES] || false;
		}
		return false;
	}

	// folder
	level() {
		return this._options[LEVEL] || 0;
	}

	// menu
	hasMenu() {
		return this.menuOptions() != null || this.menuStringOptions() != null;
	}

	private menuOptions() {
		return this._options[MENU];
	}
	private menuStringOptions() {
		return this._options[MENU_STRING];
	}
	menuEntries(): Array<NumericParamOptionsMenuEntry | StringParamOptionsMenuEntry> {
		const options = this.menuOptions() || this.menuStringOptions();
		if (options) {
			return options[ENTRIES];
		} else {
			return [];
		}
	}
	ensureValueInMenuEntries(value: number): number {
		const options = this.menuOptions();
		if (!options) {
			return value;
		}
		const entries = options[ENTRIES];
		if (entries.length == 0) {
			return value;
		}
		for (const entry of entries) {
			if (value == entry.value) {
				return value;
			}
		}
		return entries[0].value;
	}

	// multiline
	isMultiline(): boolean {
		return this._options[MULTILINE_OPTION] === true;
	}
	language(): StringParamLanguage | undefined {
		return this._options[LANGUAGE_OPTION];
	}
	isCode(): boolean {
		return this.language() != null;
	}

	// node selection
	nodeSelectionOptions() {
		return this._options[NODE_SELECTION];
	}
	nodeSelectionContext() {
		const options = this.nodeSelectionOptions();
		if (options) {
			return options[NODE_SELECTION_CONTEXT];
		}
	}
	nodeSelectionTypes() {
		const options = this.nodeSelectionOptions();
		if (options) {
			return options[NODE_SELECTION_TYPES];
		}
	}
	displayObjectMaskSelection() {
		const value = this._options[OBJECT_MASK];
		return value != null && value != false;
	}
	objectMaskInputIndex(): number {
		const value = this._options[OBJECT_MASK];
		const input = value != null ? (value as ObjectMask)[OBJECT_MASK_INPUT_INDEX] : 0;
		return input || 0;
	}
	objectMaskFromInputOnly() {
		const value = this._options[OBJECT_MASK];
		const fromInputOnly = (value as ObjectMask).fromInputOnly;
		return fromInputOnly != false;
	}

	dependentOnFoundNode() {
		if (DEPENDENT_ON_FOUND_NODE in this._options) {
			return this._options[DEPENDENT_ON_FOUND_NODE];
		} else {
			return true;
		}
	}
	dependentOnFoundParam() {
		if (DEPENDENT_ON_FOUND_PARAM in this._options) {
			return this._options[DEPENDENT_ON_FOUND_PARAM];
		} else {
			return true;
		}
	}

	// param selection
	isSelectingParam() {
		return this.param().type() == ParamType.PARAM_PATH;
		// return this.paramSelectionOptions() != null;
	}
	// paramSelectionOptions() {
	// 	return this._options[PARAM_SELECTION];
	// }
	// paramSelectionType() {
	// 	const options = this.paramSelectionOptions();
	// 	if (options) {
	// 		const type_or_boolean = options;
	// 		if (!CoreType.isBoolean(type_or_boolean)) {
	// 			return type_or_boolean;
	// 		}
	// 	}
	// }

	// range
	range(): Number2 {
		// cannot force range easily, as values are not necessarily from 0 to N
		// if(this.self.has_menu() && this.self.menu_entries()){
		// 	return [0, this.self.menu_entries().length-1 ]
		// } else {
		return this._options[RANGE_OPTION] || [0, 1];
		// }
	}
	step(): number | undefined {
		return this._options[STEP_OPTION];
	}
	asQuaternion() {
		return this._options[AS_QUATERNION] == true;
	}

	rangeLocked(): Boolean2 {
		// if(this.self.has_menu() && this.self.menu_entries()){
		// 	return [true, true]
		// } else {
		return this._options[RANGE_LOCKED_OPTION] || [false, false];
		// }
	}

	ensureInRange(value: number): number {
		const range = this.range();

		if (value >= range[0] && value <= range[1]) {
			return value;
		} else {
			if (value < range[0]) {
				return this.rangeLocked()[0] === true ? range[0] : value;
			} else {
				return this.rangeLocked()[1] === true ? range[1] : value;
			}
		}
	}

	// spare
	isSpare(): boolean {
		return this._options[SPARE_OPTION] || false;
	}

	// texture
	textureOptions() {
		return this._options[TEXTURE_OPTION];
	}
	textureAsEnv(): boolean {
		const texture_options = this.textureOptions();
		if (texture_options != null) {
			return texture_options[ENV_OPTION] === true;
		}
		return false;
	}

	// visible
	isHidden(): boolean {
		return this._options[HIDDEN_OPTION] === true || this._programaticVisibleState === false;
	}
	isVisible(): boolean {
		return !this.isHidden();
	}
	setVisibleState(state: boolean) {
		this._options[HIDDEN_OPTION] = !state;
		this.param().emit(ParamEvent.VISIBLE_UPDATED);
	}
	// label
	label() {
		return this._options[LABEL];
	}
	isLabelHidden(): boolean {
		const type = this.param().type();
		switch (type) {
			case ParamType.BUTTON: {
				return true;
			}
			case ParamType.BOOLEAN: {
				return this.isFieldHidden();
			}
			case ParamType.RAMP: {
				return this._options[HIDE_LABEL] || false;
			}
			case ParamType.STRING: {
				return (this.isCode() && this._options[HIDE_LABEL]) || false;
			}
		}
		return false;
	}
	isFieldHidden(): boolean {
		return this._options[FIELD_OPTION] === false;
	}

	// programatic visibility
	uiDataDependsOnOtherParams(): boolean {
		return VISIBLE_IF_OPTION in this._options;
	}
	visibilityPredecessors() {
		const visibilityOptions = this._options[VISIBLE_IF_OPTION];
		if (!visibilityOptions) {
			return [];
		}
		let predecessorNames: string[] = [];
		if (CoreType.isArray(visibilityOptions)) {
			arrayUniq(visibilityOptions.map((options) => Object.keys(options)).flat(), predecessorNames);
		} else {
			predecessorNames = Object.keys(visibilityOptions);
		}
		const node = this.param().node;
		const params: BaseParamType[] = [];
		arrayCompact(
			predecessorNames.map((name) => {
				const param = node.params.get(name);
				if (param) {
					return param;
				} else {
					console.error(
						`param ${name} not found as visibility condition for ${this.param().name()} in node ${this.param().node.type()}`
					);
				}
			}),
			params
		);

		return params;
	}

	private _updateVisibilityAndRemoveDirtyBound = this.updateVisibilityAndRemoveDirty.bind(this);
	private _visibility_graph_node: CoreGraphNode | undefined;
	private _ui_data_dependency_set: boolean = false;
	setUiDataDependency() {
		// currently this is only called on request on a per-param and therefore per-node basis, not on scene load for the whole scene
		if (this._ui_data_dependency_set) {
			return;
		}
		this._ui_data_dependency_set = true;
		const predecessors = this.visibilityPredecessors();
		if (predecessors.length > 0) {
			this._visibility_graph_node = new CoreGraphNode(this.param().scene(), 'param_visibility');
			for (const predecessor of predecessors) {
				this._visibility_graph_node.addGraphInput(predecessor);
			}
			this._visibility_graph_node.addPostDirtyHook(
				'_update_visibility_and_remove_dirty',
				this._updateVisibilityAndRemoveDirtyBound
			);
		}
	}
	private updateVisibilityAndRemoveDirty() {
		this.updateVisibility();
		this.param().removeDirtyState();
	}

	async updateVisibility() {
		const options = this._options[VISIBLE_IF_OPTION];
		if (options) {
			const node = this.param().node;
			const params = this.visibilityPredecessors();
			const promises = params.map((p) => {
				if (p.isDirty()) {
					return p.compute();
				}
			});
			this._programaticVisibleState = false;
			await Promise.all(promises);
			if (CoreType.isArray(options)) {
				for (const optionsSet of options) {
					const optionSetParamNames = Object.keys(optionsSet);
					const optionSetParams: BaseParamType[] = [];
					arrayCompact(
						optionSetParamNames.map((paramName) => node.params.get(paramName)),
						optionSetParams
					);
					const satisfiedValues = optionSetParams.filter((param) => param.value == optionsSet[param.name()]);

					if (satisfiedValues.length == optionSetParams.length) {
						this._programaticVisibleState = true;
					}
				}
			} else {
				const satisfiedValues = params.filter((param) => param.value == options[param.name()]);
				this._programaticVisibleState = satisfiedValues.length == params.length;
			}
			this.param().emit(ParamEvent.VISIBLE_UPDATED);
		}
	}

	/*
	 *
	 *
	 *
	 */
	// private _callbacksByOptionName: Map<keyof ParamOptions, OptionChangeCallback> | undefined;
	// onOptionChange<K extends keyof ParamOptions>(optionName: K, callback: OptionChangeCallback) {
	// 	this._callbacksByOptionName = this._callbacksByOptionName || new Map();
	// 	this._callbacksByOptionName.set(optionName, callback);
	// }
	// private _runOptionCallback(optionName: keyof ParamOptions) {
	// 	if (!this._callbacksByOptionName) {
	// 		return;
	// 	}
	// 	const callback = this._callbacksByOptionName.get(optionName);
	// 	if (!callback) {
	// 		return;
	// 	}
	// 	callback();
	// }
}
