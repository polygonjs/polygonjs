// nodes
import {BaseAnimNodeType} from '../nodes/anim/_Base';
import {BaseAudioNodeType} from '../nodes/audio/_Base';
import {BaseCopNodeType} from '../nodes/cop/_Base';
import {BaseEventNodeType} from '../nodes/event/_Base';
import {BaseGlNodeType} from '../nodes/gl/_Base';
import {BaseJsNodeType} from '../nodes/js/_Base';
import {BaseManagerNodeType} from '../nodes/manager/_Base';
import {BaseMatNodeType} from '../nodes/mat/_Base';
import {BaseObjNodeType} from '../nodes/obj/_Base';
import {BasePostProcessNodeType} from '../nodes/post/_Base';
import {BaseRopNodeType} from '../nodes/rop/_Base';
import {BaseSopNodeType} from '../nodes/sop/_Base';
// registers
// import {GeoNodeChildrenMap} from './registers/nodes/Sop';
// import {GlNodeChildrenMap} from './registers/nodes/Gl';
// import {EventNodeChildrenMap} from './registers/nodes/Event';
// import {CopNodeChildrenMap} from './registers/nodes/Cop';
// import {AnimNodeChildrenMap} from './registers/nodes/Anim';
// import {MatNodeChildrenMap} from './registers/nodes/Mat';
// import {ObjNodeChildrenMap} from './registers/nodes/Obj';
// import {PostNodeChildrenMap} from './registers/nodes/Post';
// import {RopNodeChildrenMap} from './registers/nodes/Rop';
// import {AudioNodeChildrenMap} from './registers/nodes/Audio';
import {TypedNode} from '../nodes/_Base';
// import { JsNodeChildrenMap } from './registers/nodes/Js';

export enum NodeContext {
	ACTOR = 'actor',
	ANIM = 'anim',
	AUDIO = 'audio',
	COP = 'cop',
	CSG = 'csg',
	EVENT = 'event',
	GL = 'gl',
	JS = 'js',
	MANAGER = 'manager',
	MAT = 'mat',
	OBJ = 'obj',
	POST = 'post',
	ROP = 'rop',
	SOP = 'sop',
}

export type NodeContextUnion =
	| NodeContext.ACTOR
	| NodeContext.ANIM
	| NodeContext.AUDIO
	| NodeContext.COP
	| NodeContext.CSG
	| NodeContext.EVENT
	| NodeContext.GL
	| NodeContext.JS
	| NodeContext.MANAGER
	| NodeContext.MAT
	| NodeContext.OBJ
	| NodeContext.POST
	| NodeContext.ROP
	| NodeContext.SOP;

export enum NetworkNodeType {
	ACTOR = 'actorsNetwork',
	ANIM = 'animationsNetwork',
	AUDIO = 'audioNetwork',
	COP = 'copNetwork',
	CSG = 'csgNetwork',
	EVENT = 'eventsNetwork',
	MAT = 'materialsNetwork',
	POST = 'postProcessNetwork',
	ROP = 'renderersNetwork',
	SOLVER = 'solver',
	SUBNET = 'subnet',
	DECOMPOSE = 'decompose',
}
export enum NetworkChildNodeType {
	INPUT = 'subnetInput',
	OUTPUT = 'subnetOutput',
}
export enum CameraNodeType {
	PERSPECTIVE = 'perspectiveCamera',
	ORTHOGRAPHIC = 'orthographicCamera',
}
export enum CameraSopNodeType {
	CONTROLS = 'cameraControls',
	CSS_RENDERER = 'cameraCSSRenderer',
	FRAME_MODE = 'cameraFrameMode',
	POST_PROCESS = 'cameraPostProcess',
	RENDER_SCENE = 'cameraRenderScene',
	RENDERER = 'cameraRenderer',
}
export const CAMERA_TYPES = [CameraNodeType.ORTHOGRAPHIC, CameraNodeType.PERSPECTIVE];

export enum CameraControlsNodeType {
	// DEVICE_ORIENTATION = 'cameraDeviceOrientationControls',
	MAP = 'cameraMapControls',
	ORBIT = 'cameraOrbitControls',
	FIRST_PERSON = 'firstPersonControls',
	PLAYER = 'playerControls',
	MOBILE_JOYSTICK = 'mobileJoystickControls',
}
// export const CAMERA_CONTROLS_NODE_TYPES: Readonly<string[]> = [
// 	// CameraControlsNodeType.DEVICE_ORIENTATION,
// 	CameraControlsNodeType.MAP,
// 	CameraControlsNodeType.ORBIT,
// 	CameraControlsNodeType.FIRST_PERSON,
// 	CameraControlsNodeType.MOBILE_JOYSTICK,
// ];
export enum AudioNodeAnalyserType {
	FFT = 'FFT',
	METER = 'meter',
	WAVEFORM = 'waveform',
}
export const AUDIO_ANALYSER_NODES: Readonly<string[]> = [
	AudioNodeAnalyserType.FFT,
	AudioNodeAnalyserType.METER,
	AudioNodeAnalyserType.WAVEFORM,
];

export type NodeTypeMapGeneric = {[key in NodeContext]: TypedNode<key, any>};
export interface BaseNodeByContextMap extends NodeTypeMapGeneric {
	[NodeContext.ANIM]: BaseAnimNodeType;
	[NodeContext.AUDIO]: BaseAudioNodeType;
	[NodeContext.COP]: BaseCopNodeType;
	[NodeContext.EVENT]: BaseEventNodeType;
	[NodeContext.GL]: BaseGlNodeType;
	[NodeContext.JS]: BaseJsNodeType;
	[NodeContext.MANAGER]: BaseManagerNodeType;
	[NodeContext.MAT]: BaseMatNodeType;
	[NodeContext.OBJ]: BaseObjNodeType;
	[NodeContext.POST]: BasePostProcessNodeType;
	[NodeContext.SOP]: BaseSopNodeType;
	[NodeContext.ROP]: BaseRopNodeType;
}

// export interface ChildrenNodeMapByContextMap {
// 	[NodeContext.ANIM]: AnimNodeChildrenMap;
// 	[NodeContext.AUDIO]: AudioNodeChildrenMap;
// 	[NodeContext.COP]: CopNodeChildrenMap;
// 	[NodeContext.EVENT]: EventNodeChildrenMap;
// 	[NodeContext.GL]: GlNodeChildrenMap;
// 	[NodeContext.JS]: JsNodeChildrenMap;
// 	[NodeContext.MANAGER]: {};
// 	[NodeContext.MAT]: MatNodeChildrenMap;
// 	[NodeContext.OBJ]: ObjNodeChildrenMap;
// 	[NodeContext.POST]: PostNodeChildrenMap;
// 	[NodeContext.SOP]: GeoNodeChildrenMap;
// 	[NodeContext.ROP]: RopNodeChildrenMap;
// }

export interface NodeContextAndType {
	context: NodeContext;
	type: string;
}
