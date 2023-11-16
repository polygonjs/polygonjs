/**
 * Creates a pan/zoom controls for a camera
 *
 *
 */
import {Camera, MOUSE, TOUCH} from 'three';
import {TypedCameraControlsEventNode} from './_BaseCameraControls';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {CameraControlsNodeType} from '../../poly/NodeContext';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {PanZoomControls} from '../../../modules/core/controls/PanZoomControls';

const OUTPUT_START = 'start';
const OUTPUT_CHANGE = 'change';
const OUTPUT_END = 'end';

export enum MouseControl {
	PAN = 'pan',
	DOLLY = 'dolly',
	NO_ACTION = 'no action',
}
export const MOUSE_CONTROLS: MouseControl[] = [MouseControl.DOLLY, MouseControl.PAN, MouseControl.NO_ACTION];
enum TouchControl {
	PAN = 'pan',
	DOLLY_PAN = 'dolly + pan',
	NO_ACTION = 'no action',
}
const TOUCH_CONTROLS: TouchControl[] = [TouchControl.PAN, TouchControl.DOLLY_PAN, TouchControl.NO_ACTION];

type ThreeMouseControl = 0 | 1 | 2;
type ThreeTouchControl = 0 | 1 | 2 | 3;

const THREE_MOUSE_BY_MOUSE_CONTROL: Record<MouseControl, ThreeMouseControl | null> = {
	[MouseControl.DOLLY]: MOUSE.DOLLY,
	[MouseControl.PAN]: MOUSE.PAN,
	[MouseControl.NO_ACTION]: null,
};
const THREE_TOUCH_BY_TOUCH_CONTROL: Record<TouchControl, ThreeTouchControl | null> = {
	[TouchControl.PAN]: TOUCH.PAN,
	[TouchControl.DOLLY_PAN]: TOUCH.DOLLY_PAN,
	[TouchControl.NO_ACTION]: null,
};

class CameraPanZoomEventParamsConfig extends NodeParamsConfig {
	main = ParamConfig.FOLDER();
	/** @param enable/disable */
	enabled = ParamConfig.BOOLEAN(1);
	/** @param toggle on to allow pan */
	allowPan = ParamConfig.BOOLEAN(1);
	/** @param toggle on to allow zoom */
	allowZoom = ParamConfig.BOOLEAN(1);
	/** @param zoom speed */
	zoomSpeed = ParamConfig.FLOAT(1, {
		range: [0, 2],
		rangeLocked: [true, false],
		visibleIf: {
			allowZoom: 1,
		},
	});
	/** @param zoom to cursor */
	zoomToCursor = ParamConfig.BOOLEAN(1, {
		visibleIf: {
			allowZoom: 1,
		},
	});
	/** @param toggle on to have damping */
	tdamping = ParamConfig.BOOLEAN(1);
	/** @param damping value */
	damping = ParamConfig.FLOAT(0.1, {
		visibleIf: {tdamping: true},
	});
	/** @param toggle on to have the pan in screen space */
	screenSpacePanning = ParamConfig.BOOLEAN(1);
	limits = ParamConfig.FOLDER();
	/** @param smallest distance the camera can go to the target (perspective cameras only) */
	// minDistance = ParamConfig.FLOAT(0.1, {
	// 	range: [0.1, 100],
	// 	rangeLocked: [true, false],
	// });
	// /** @param max distance the camera can go away the target (perspective cameras only) */
	// maxDistance = ParamConfig.FLOAT(50, {
	// 	range: [0, 100],
	// 	rangeLocked: [true, false],
	// });
	/** @param min zoom (orthographic cameras only) */
	minZoom = ParamConfig.FLOAT(0.01, {
		range: [0.01, 100],
		rangeLocked: [true, false],
	});
	/** @param max zoom (orthographic cameras only) */
	maxZoom = ParamConfig.FLOAT(50, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param clamp position */
	clampPosition = ParamConfig.BOOLEAN(false);
	/** @param min position */
	positionMin = ParamConfig.VECTOR3([-10, -10, -10], {
		visibleIf: {clampPosition: 1},
	});
	/** @param max position */
	positionMax = ParamConfig.VECTOR3([10, 10, 10], {
		visibleIf: {clampPosition: 1},
	});
	controls = ParamConfig.FOLDER();
	/** @param leftMouseButton */
	leftMouseButton = ParamConfig.INTEGER(MOUSE_CONTROLS.indexOf(MouseControl.PAN), {
		menu: {
			entries: MOUSE_CONTROLS.map((name, value) => ({name, value})),
		},
	});
	/** @param leftMouseButton */
	middleMouseButton = ParamConfig.INTEGER(MOUSE_CONTROLS.indexOf(MouseControl.DOLLY), {
		menu: {
			entries: MOUSE_CONTROLS.map((name, value) => ({name, value})),
		},
	});
	/** @param leftMouseButton */
	rightMouseButton = ParamConfig.INTEGER(MOUSE_CONTROLS.indexOf(MouseControl.PAN), {
		menu: {
			entries: MOUSE_CONTROLS.map((name, value) => ({name, value})),
		},
	});
	/** @param 1 finger touch */
	oneFingerTouch = ParamConfig.INTEGER(TOUCH_CONTROLS.indexOf(TouchControl.PAN), {
		menu: {
			entries: TOUCH_CONTROLS.map((name, value) => ({name, value})),
		},
		separatorBefore: true,
	});
	/** @param 2 fingers touch */
	twoFingersTouch = ParamConfig.INTEGER(TOUCH_CONTROLS.indexOf(TouchControl.DOLLY_PAN), {
		menu: {
			entries: TOUCH_CONTROLS.map((name, value) => ({name, value})),
		},
	});
}
const ParamsConfig = new CameraPanZoomEventParamsConfig();

export class CameraPanZoomControlsEventNode extends TypedCameraControlsEventNode<CameraPanZoomEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CameraControlsNodeType.PAN_ZOOM;
	}
	endEventName() {
		return 'end';
	}
	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(OUTPUT_START, EventConnectionPointType.BASE),
			new EventConnectionPoint(OUTPUT_CHANGE, EventConnectionPointType.BASE),
			new EventConnectionPoint(OUTPUT_END, EventConnectionPointType.BASE),
		]);
	}

	private _controlsByElementId: Map<string, PanZoomControls> = new Map();
	private _firstControls: PanZoomControls | undefined;

	protected _createControls(camera: Camera, element: HTMLElement) {
		return new PanZoomControls(camera, element);
	}
	async createControlsInstance(camera: Camera, element: HTMLElement) {
		const controls = this._createControls(camera, element);
		// controls.addEventListener('end', () => {
		// 	this._on_controls_end(controls);
		// });

		this._controlsByElementId.set(element.id, controls);
		this._updateCache();
		this._bind_listeners_to_controls_instance(controls);
		return controls;
	}
	protected _bind_listeners_to_controls_instance(controls: PanZoomControls) {
		controls.addEventListener('start', () => {
			this.dispatchEventToOutput(OUTPUT_START, {});
		});
		controls.addEventListener('change', () => {
			this.dispatchEventToOutput(OUTPUT_CHANGE, {});
		});
		controls.addEventListener('end', () => {
			this.dispatchEventToOutput(OUTPUT_END, {});
		});
	}

	setupControls(controls: PanZoomControls) {
		controls.enabled = isBooleanTrue(this.pv.enabled);

		controls.enablePan = isBooleanTrue(this.pv.allowPan);
		controls.enableZoom = isBooleanTrue(this.pv.allowZoom);
		controls.zoomSpeed = this.pv.zoomSpeed;
		controls.zoomToCursor = isBooleanTrue(this.pv.zoomToCursor);

		controls.enableDamping = isBooleanTrue(this.pv.tdamping);
		controls.dampingFactor = this.pv.damping;

		// controls.rotateSpeed = this.pv.rotateSpeed;

		controls.screenSpacePanning = isBooleanTrue(this.pv.screenSpacePanning);

		// controls.minDistance = this.pv.minDistance;
		// controls.maxDistance = this.pv.maxDistance;
		controls.minZoom = this.pv.minZoom;
		controls.maxZoom = this.pv.maxZoom;
		controls.clampPosition = this.pv.clampPosition;
		controls.positionBounds.min.copy(this.pv.positionMin);
		controls.positionBounds.max.copy(this.pv.positionMax);

		// this._set_azimuth_angle(controls);
		// controls.minPolarAngle = this.pv.polarAngleRange.x;
		// controls.maxPolarAngle = this.pv.polarAngleRange.y;
		// controls.target.copy(this.pv.target);
		if (controls.enabled) {
			controls.update(null); // necessary if target is not 0,0,0
		}

		// overrides
		controls.mouseButtons.LEFT = THREE_MOUSE_BY_MOUSE_CONTROL[MOUSE_CONTROLS[this.pv.leftMouseButton]];
		controls.mouseButtons.MIDDLE = THREE_MOUSE_BY_MOUSE_CONTROL[MOUSE_CONTROLS[this.pv.middleMouseButton]];
		controls.mouseButtons.RIGHT = THREE_MOUSE_BY_MOUSE_CONTROL[MOUSE_CONTROLS[this.pv.rightMouseButton]];
		controls.touches.ONE = THREE_TOUCH_BY_TOUCH_CONTROL[TOUCH_CONTROLS[this.pv.oneFingerTouch]];
		controls.touches.TWO = THREE_TOUCH_BY_TOUCH_CONTROL[TOUCH_CONTROLS[this.pv.twoFingersTouch]];
		// controls.touches.ONE = TOUCH.ROTATE;
		// controls.touches.TWO = TOUCH.DOLLY_PAN;

		// controls.enableKeys = isBooleanTrue(this.pv.enableKeys);
		// if (controls.enableKeys) {
		// 	controls.keyMode = KEYS_MODES[this.pv.keysMode];
		// 	controls.keyRotateSpeedVertical = this.pv.keysRotateSpeedVertical;
		// 	controls.keyRotateSpeedHorizontal = this.pv.keysRotateSpeedHorizontal;
		// 	controls.keyPanSpeed = this.pv.keysPanSpeed;
		// }
	}
	// private _set_azimuth_angle(controls: OrbitControls) {
	// 	if (isBooleanTrue(this.pv.limitAzimuthAngle)) {
	// 		controls.minAzimuthAngle = this.pv.azimuthAngleRange.x;
	// 		controls.maxAzimuthAngle = this.pv.azimuthAngleRange.y;
	// 	} else {
	// 		controls.minAzimuthAngle = Infinity;
	// 		controls.maxAzimuthAngle = Infinity;
	// 	}
	// }

	updateRequired(): boolean {
		return false;
		// return isBooleanTrue(this.pv.tdamping);
	}

	// set_from_camera_node(controls: CameraControls, camera_node: BaseCameraObjNodeType): void {
	// 	const target = camera_node.params.vector3('target');
	// 	controls.target.copy(target);
	// 	console.warn('set from camera node');
	// }

	// private _on_controls_end(controls: OrbitControls) {
	// 	if (!isBooleanTrue(this.pv.updateTargetEndMoveEnd)) {
	// 		return;
	// 	}
	// 	if (!isBooleanTrue(this.pv.allowPan)) {
	// 		// target should not be updated if pan is not allowed
	// 		return;
	// 	}
	// 	controls.target.toArray(_targetArray);
	// 	this.p.target.set(_targetArray);
	// }

	// static PARAM_CALLBACK_updateTarget(node: CameraPanZoomControlsEventNode) {
	// 	node._updateTarget();
	// }
	// private _updateTarget() {
	// 	this.setTarget(this.pv.target);
	// }
	// target(target: Vector3) {
	// 	if (!this._firstControls) {
	// 		return;
	// 	}
	// 	target.copy(this._firstControls.target);
	// }
	// setTarget(newTarget: Vector3) {
	// 	this._controlsByElementId.forEach((control, element_id) => {
	// 		const destTarget = control.target;
	// 		if (!destTarget.equals(newTarget)) {
	// 			destTarget.copy(newTarget);
	// 			control.update();
	// 		}
	// 	});
	// }

	disposeControlsForHtmlElementId(html_element_id: string) {
		// this method is important so that we can do the following steps:
		// 1. assign an orbit_controls to the camera
		// 2. remove the controls
		// 3. update the target param of the controls, and this doesn't affect the camera (nor should it!)
		const controls = this._controlsByElementId.get(html_element_id);
		if (controls) {
			// controls.dispose(); // no need to dispose here, as it is done by the viewer for now
			this._controlsByElementId.delete(html_element_id);
		}
		this._updateCache();
	}
	private _updateCache() {
		this._firstControls = undefined;
		this._controlsByElementId.forEach((controls) => {
			this._firstControls = this._firstControls || controls;
		});
	}
}
