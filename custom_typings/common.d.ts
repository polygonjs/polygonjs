interface StringsByString {
	[propName: string]: string;
}
interface NumbersByString {
	[propName: string]: number;
}
interface ObjectsByString {
	[propName: string]: object;
}
interface StringsArrayByString {
	[propName: string]: string[];
}
interface NumbersArrayByString {
	[propName: string]: number[];
}

// math
interface Vec2 {
	x: number;
	y: number;
}
interface Vec3 {
	x: number;
	y: number;
	z: number;
}
interface Vec4 {
	x: number;
	y: number;
	z: number;
	w: number;
}
interface Col {
	r: number;
	g: number;
	b: number;
}
interface LngLatLike {
	lng: number;
	lat: number;
}

// attrib
type NumericAttribValue = number | Vec2 | Vec3 | Vec4 | Col;
type AttribValue = string | NumericAttribValue;

// events
declare enum NodeEvent {
	CREATED = 'node_created',
	DELETED = 'node_deleted',
	NAME_UPDATED = 'node_name_update',
	OVERRIDE_CLONABLE_STATE_UPDATE = 'node_override_clonable_state_update',
	NAMED_OUTPUTS_UPDATED = 'node_named_outputs_updated',
	NAMED_INPUTS_UPDATED = 'node_named_inputs_updated',
	INPUTS_UPDATED = 'node_inputs_updated',
	PARAMS_UPDATED = 'node_params_updated',
	UI_DATA_UPDATED = 'node_ui_data_updated',
	ERROR_UPDATED = 'node_error_updated',
	FLAG_BYPASS_UPDATED = 'bypass_flag_updated',
	FLAG_DISPLAY_UPDATED = 'display_flag_updated',
	SELECTION_UPDATED = 'selection_updated',
}
declare enum ParamEvent {
	VISIBLE_UPDATED = 'param_visible_updated',
	UPDATED = 'param_updated',
	DELETED = 'param_deleted',
}
declare enum SceneEvent {
	FRAME_RANGE_UPDATED = 'scene_frame_range_updated',
	FRAME_UPDATED = 'scene_frame_updated',
	PLAY_STATE_UPDATED = 'scene_play_state_updated',
}

// params
// type ParamInputValue = number | string
// type ParamDefaultValue =
// 	| number
// 	| string
// 	| [number, number]
// 	| [number, number, number]
// 	| [number, number, number, number]

declare enum ParamType {
	BUTTON = 'button',
	COLOR = 'color',
	FLOAT = 'float',
	INTEGER = 'integer',
	OPERATOR_PATH = 'operator_path',
	SEPARATOR = 'separator',
	STRING = 'string',
	BOOLEAN = 'boolean',
	VECTOR2 = 'vector2',
	VECTOR3 = 'vector3',
	VECTOR4 = 'vector4',
	RAMP = 'ramp',
}
declare enum NodeContext {
	MANAGER = 'managers',
	OBJ = 'objects',
	SOP = 'sop',
	MAT = 'mat',
	COP = 'cop',
	POST = 'post',
	GL = 'gl',
	EVENT = 'event',
}

// math
interface Vector2Like {
	x: number;
	y: number;
}
interface Vector3Like {
	x: number;
	y: number;
	z: number;
}
interface Vector4Like {
	x: number;
	y: number;
	z: number;
	w: number;
}
interface ColorLike {
	r: number;
	g: number;
	b: number;
}
type BooleanAsNumber = 0 | 1;
// interface BoxComponents {
// 	min: Vector3Components
// 	max: Vector3Components
// }
