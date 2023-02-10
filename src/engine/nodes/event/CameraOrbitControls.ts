/**
 * Creates a THREE OrbitControls
 *
 * @remarks
 * This can be linked to a camera's controls parameter
 *
 */
import {Number3} from '../../../types/GlobalTypes';
import {Camera, Vector3} from 'three';
import {TypedCameraControlsEventNode} from './_BaseCameraControls';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {BaseNodeType} from '../_Base';
// import {OrbitControls} from '../../../../modules/three/examples/jsm/controls/OrbitControls';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {CameraControlsNodeType} from '../../poly/NodeContext';
import {isBooleanTrue} from '../../../core/BooleanValue';

const OUTPUT_START = 'start';
const OUTPUT_CHANGE = 'change';
const OUTPUT_END = 'end';

// enum KeysMode {
// 	PAN = 'pan',
// 	ROTATE = 'rotate',
// }
// const KEYS_MODES: KeysMode[] = [KeysMode.PAN, KeysMode.ROTATE];

class CameraOrbitEventParamsConfig extends NodeParamsConfig {
	/** @param enable/disable */
	enabled = ParamConfig.BOOLEAN(1);
	/** @param toggle on to allow pan */
	allowPan = ParamConfig.BOOLEAN(1);
	/** @param toggle on to allow rotate */
	allowRotate = ParamConfig.BOOLEAN(1);
	/** @param toggle on to allow zoom */
	allowZoom = ParamConfig.BOOLEAN(1);
	/** @param toggle on to have damping */
	tdamping = ParamConfig.BOOLEAN(1);
	/** @param damping value */
	damping = ParamConfig.FLOAT(0.1, {
		visibleIf: {tdamping: true},
	});
	/** @param toggle on to have the pan in screen space */
	screenSpacePanning = ParamConfig.BOOLEAN(1);
	/** @param rotation speed */
	rotateSpeed = ParamConfig.FLOAT(0.5);
	/** @param smallest distance the camera can go to the target */
	minDistance = ParamConfig.FLOAT(0.1, {
		range: [0.1, 100],
		rangeLocked: [true, false],
	});
	/** @param max distance the camera can go away the target */
	maxDistance = ParamConfig.FLOAT(50, {
		range: [0, 100],
		rangeLocked: [true, false],
	});
	/** @param toggle on to limit the azimuth (up-down) angle */
	limitAzimuthAngle = ParamConfig.BOOLEAN(0);
	/** @param azimuth angle range */
	azimuthAngleRange = ParamConfig.VECTOR2(['-2*$PI', '2*$PI'], {
		visibleIf: {limitAzimuthAngle: 1},
	});
	/** @param polar (left-right) angle range */
	polarAngleRange = ParamConfig.VECTOR2([0, '$PI']);
	/** @param target position. This is updated automatically as the camera is controlled by user events */
	target = ParamConfig.VECTOR3([0, 0, 0], {
		cook: false,
		computeOnDirty: true,
		callback: (node: BaseNodeType) => {
			CameraOrbitControlsEventNode.PARAM_CALLBACK_updateTarget(node as CameraOrbitControlsEventNode);
		},
	});
	/** @param toggle on to enable keys */
	// enableKeys = ParamConfig.BOOLEAN(0);
	// /** @param key modes (pan or rotate) */
	// keysMode = ParamConfig.INTEGER(KEYS_MODES.indexOf(KeysMode.PAN), {
	// 	visibleIf: {enableKeys: 1},
	// 	menu: {
	// 		entries: KEYS_MODES.map((name, value) => {
	// 			return {name, value};
	// 		}),
	// 	},
	// });
	// /** @param keys pan speed */
	// keysPanSpeed = ParamConfig.FLOAT(7, {
	// 	range: [0, 10],
	// 	rangeLocked: [false, false],
	// 	visibleIf: {enableKeys: 1, keysMode: KEYS_MODES.indexOf(KeysMode.PAN)},
	// });
	// /** @param keys rotate speed vertical */
	// keysRotateSpeedVertical = ParamConfig.FLOAT(1, {
	// 	range: [0, 1],
	// 	rangeLocked: [false, false],
	// 	visibleIf: {enableKeys: 1, keysMode: KEYS_MODES.indexOf(KeysMode.ROTATE)},
	// });
	// /** @param keys rotate speed horizontal */
	// keysRotateSpeedHorizontal = ParamConfig.FLOAT(1, {
	// 	range: [0, 1],
	// 	rangeLocked: [false, false],
	// 	visibleIf: {enableKeys: 1, keysMode: KEYS_MODES.indexOf(KeysMode.ROTATE)},
	// });
}
const ParamsConfig = new CameraOrbitEventParamsConfig();

export class CameraOrbitControlsEventNode extends TypedCameraControlsEventNode<CameraOrbitEventParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CameraControlsNodeType.ORBIT;
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

	private _controlsByElementId: Map<string, OrbitControls> = new Map();
	private _firstControls: OrbitControls | undefined;

	async createControlsInstance(camera: Camera, element: HTMLElement) {
		const controls = new OrbitControls(camera, element);
		controls.addEventListener('end', () => {
			this._on_controls_end(controls);
		});

		this._controlsByElementId.set(element.id, controls);
		this._updateCache();
		this._bind_listeners_to_controls_instance(controls);
		return controls;
	}
	protected _bind_listeners_to_controls_instance(controls: OrbitControls) {
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

	setupControls(controls: OrbitControls) {
		controls.enabled = isBooleanTrue(this.pv.enabled);

		controls.enablePan = isBooleanTrue(this.pv.allowPan);
		controls.enableRotate = isBooleanTrue(this.pv.allowRotate);
		controls.enableZoom = isBooleanTrue(this.pv.allowZoom);

		controls.enableDamping = isBooleanTrue(this.pv.tdamping);
		controls.dampingFactor = this.pv.damping;

		controls.rotateSpeed = this.pv.rotateSpeed;

		controls.screenSpacePanning = isBooleanTrue(this.pv.screenSpacePanning);

		controls.minDistance = this.pv.minDistance;
		controls.maxDistance = this.pv.maxDistance;

		this._set_azimuth_angle(controls);
		controls.minPolarAngle = this.pv.polarAngleRange.x;
		controls.maxPolarAngle = this.pv.polarAngleRange.y;
		controls.target.copy(this.pv.target);
		if (controls.enabled) {
			controls.update(); // necessary if target is not 0,0,0
		}

		// controls.enableKeys = isBooleanTrue(this.pv.enableKeys);
		// if (controls.enableKeys) {
		// 	controls.keyMode = KEYS_MODES[this.pv.keysMode];
		// 	controls.keyRotateSpeedVertical = this.pv.keysRotateSpeedVertical;
		// 	controls.keyRotateSpeedHorizontal = this.pv.keysRotateSpeedHorizontal;
		// 	controls.keyPanSpeed = this.pv.keysPanSpeed;
		// }
	}
	private _set_azimuth_angle(controls: OrbitControls) {
		if (isBooleanTrue(this.pv.limitAzimuthAngle)) {
			controls.minAzimuthAngle = this.pv.azimuthAngleRange.x;
			controls.maxAzimuthAngle = this.pv.azimuthAngleRange.y;
		} else {
			controls.minAzimuthAngle = Infinity;
			controls.maxAzimuthAngle = Infinity;
		}
	}

	updateRequired(): boolean {
		return isBooleanTrue(this.pv.tdamping);
	}

	// set_from_camera_node(controls: CameraControls, camera_node: BaseCameraObjNodeType): void {
	// 	const target = camera_node.params.vector3('target');
	// 	controls.target.copy(target);
	// 	console.warn('set from camera node');
	// }

	private _target_array: Number3 = [0, 0, 0];
	private _on_controls_end(controls: OrbitControls) {
		if (!isBooleanTrue(this.pv.allowPan)) {
			// target should not be updated if pan is not allowed
			return;
		}
		controls.target.toArray(this._target_array);
		this.p.target.set(this._target_array);
	}

	static PARAM_CALLBACK_updateTarget(node: CameraOrbitControlsEventNode) {
		node._updateTarget();
	}
	private _updateTarget() {
		this.setTarget(this.pv.target);
	}
	target(target: Vector3) {
		if (!this._firstControls) {
			return;
		}
		target.copy(this._firstControls.target);
	}
	setTarget(newTarget: Vector3) {
		this._controlsByElementId.forEach((control, element_id) => {
			const destTarget = control.target;
			if (!destTarget.equals(newTarget)) {
				destTarget.copy(newTarget);
				control.update();
			}
		});
	}

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
