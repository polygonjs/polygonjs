/**
 * Creates a PointerLockControls
 *
 * @remarks
 * This allows you to create a First-Person navigation, using the WASD keys.
 *
 */
import {Camera} from 'three/src/cameras/Camera';
import {TypedCameraControlsEventNode} from './_BaseCameraControls';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {EventConnectionPoint, EventConnectionPointType} from '../utils/io/connections/Event';
import {PointerLockControls} from '../../../modules/core/controls/PointerLockControls';
import {CameraControlsNodeType, NodeContext} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {ObjType} from '../../poly/registers/nodes/types/Obj';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {Capsule} from 'three/examples/jsm/math/Capsule';
import {Vector3} from 'three/src/math/Vector3';

const EVENT_LOCK = 'lock';
const EVENT_CHANGE = 'change';
const EVENT_UNLOCK = 'unlock';

type PointerLockControlsMap = Map<string, PointerLockControls>;

class FirstPersonEventParamsConfig extends NodeParamsConfig {
	/** @param click to lick controls */
	lock = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FirstPersonControlsEventNode.PARAM_CALLBACK_lock_controls(node as FirstPersonControlsEventNode);
		},
	});
	/** @param click to lick controls */
	minPolarAngle = ParamConfig.FLOAT(0, {
		range: [0, Math.PI],
		rangeLocked: [true, true],
	});
	/** @param click to lick controls */
	maxPolarAngle = ParamConfig.FLOAT(Math.PI, {
		range: [0, Math.PI],
		rangeLocked: [true, true],
	});
	/** @param travel speed */
	speed = ParamConfig.FLOAT(1);
	/** @param detects collisions */
	collideWithGeo = ParamConfig.BOOLEAN(0);
	/** @param geometry to collide with */
	collidingGeo = ParamConfig.NODE_PATH('', {
		nodeSelection: {
			context: NodeContext.OBJ,
			types: [ObjType.GEO],
		},
		visibleIf: {collideWithGeo: true},
	});
	/** @param recompute colliding geo */
	recomputeCollidingGeo = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType) => {
			FirstPersonControlsEventNode.PARAM_CALLBACK_recomputeCollidingGeo(node as FirstPersonControlsEventNode);
		},
		visibleIf: {collideWithGeo: true},
	});
	/** @param capsule height range */
	capsuleHeightRange = ParamConfig.VECTOR2([0.3, 1], {
		visibleIf: {collideWithGeo: true},
	});
	/** @param capsule radius */
	capsuleRadius = ParamConfig.FLOAT(0.3, {
		visibleIf: {collideWithGeo: true},
	});
}
const ParamsConfig = new FirstPersonEventParamsConfig();

export class FirstPersonControlsEventNode extends TypedCameraControlsEventNode<FirstPersonEventParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return CameraControlsNodeType.FIRST_PERSON;
	}
	endEventName() {
		return 'unlock';
	}

	initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new EventConnectionPoint(EVENT_LOCK, EventConnectionPointType.BASE, this.lockControls.bind(this)),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new EventConnectionPoint(EVENT_LOCK, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_CHANGE, EventConnectionPointType.BASE),
			new EventConnectionPoint(EVENT_UNLOCK, EventConnectionPointType.BASE),
		]);
	}

	private _controls_by_element_id: PointerLockControlsMap = new Map();

	async create_controls_instance(camera: Camera, element: HTMLElement) {
		const controls = new PointerLockControls(camera, element);

		this._controls_by_element_id.set(element.id, controls);
		this._bind_listeners_to_controls_instance(controls);
		return controls;
	}

	protected _bind_listeners_to_controls_instance(controls: PointerLockControls) {
		controls.addEventListener(EVENT_LOCK, () => {
			this._createKeysEvents(controls);
			this.dispatchEventToOutput(EVENT_LOCK, {});
		});
		controls.addEventListener(EVENT_CHANGE, () => {
			this.dispatchEventToOutput(EVENT_CHANGE, {});
		});
		controls.addEventListener(EVENT_UNLOCK, () => {
			this._removeKeysEvents();
			this.dispatchEventToOutput(EVENT_UNLOCK, {});
		});
	}

	private _onKeyDown(event: KeyboardEvent, controls: PointerLockControls) {
		switch (event.code) {
			case 'ArrowUp':
			case 'KeyW':
				controls.setMoveForward(true);
				break;

			case 'ArrowLeft':
			case 'KeyA':
				controls.setMoveLeft(true);
				break;

			case 'ArrowDown':
			case 'KeyS':
				controls.setMoveBackward(true);
				break;

			case 'ArrowRight':
			case 'KeyD':
				controls.setMoveRight(true);
				break;

			// case 'Space':
			// 	if ( canJump === true ) velocity.y += 350;
			// 	canJump = false;
			// 	break;
		}
	}
	private _onKeyUp(event: KeyboardEvent, controls: PointerLockControls) {
		switch (event.code) {
			case 'ArrowUp':
			case 'KeyW':
				controls.setMoveForward(false);
				break;

			case 'ArrowLeft':
			case 'KeyA':
				controls.setMoveLeft(false);
				break;

			case 'ArrowDown':
			case 'KeyS':
				controls.setMoveBackward(false);
				break;

			case 'ArrowRight':
			case 'KeyD':
				controls.setMoveRight(false);
				break;
		}
	}
	private _onKeyDownBound: ((event: KeyboardEvent) => void) | undefined;
	private _onKeyUpBound: ((event: KeyboardEvent) => void) | undefined;
	private _createKeysEvents(controls: PointerLockControls) {
		this._onKeyDownBound = (event: KeyboardEvent) => {
			this._onKeyDown(event, controls);
		};
		this._onKeyUpBound = (event: KeyboardEvent) => {
			this._onKeyUp(event, controls);
		};
		document.addEventListener('keydown', this._onKeyDownBound);
		document.addEventListener('keyup', this._onKeyUpBound);
	}
	private _removeKeysEvents() {
		if (this._onKeyDownBound && this._onKeyUpBound) {
			document.removeEventListener('keydown', this._onKeyDownBound);
			document.removeEventListener('keyup', this._onKeyUpBound);
		}
	}

	update_required() {
		return true;
	}

	setup_controls(controls: PointerLockControls) {
		controls.minPolarAngle = this.pv.minPolarAngle;
		controls.maxPolarAngle = this.pv.maxPolarAngle;
		controls.speed = this.pv.speed;

		this._setupCollisionGeo(controls);
	}
	private async _setupCollisionGeo(controls: PointerLockControls) {
		if (isBooleanTrue(this.pv.collideWithGeo)) {
			const objNode = this.pv.collidingGeo.nodeWithContext(NodeContext.OBJ);
			if (objNode) {
				const displayNode = await objNode.displayNodeController?.displayNode();
				displayNode?.compute();
				const object = objNode.object;
				controls.setCheckCollisions(object);
				controls.setCollisionCapsule(
					new Capsule(
						new Vector3(0, this.pv.capsuleHeightRange.x, 0),
						new Vector3(this.pv.capsuleHeightRange.y),
						this.pv.capsuleRadius
					)
				);
			}
		} else {
			controls.setCheckCollisions();
		}
	}

	dispose_controls_for_html_element_id(html_element_id: string) {
		const controls = this._controls_by_element_id.get(html_element_id);
		if (controls) {
			this._controls_by_element_id.delete(html_element_id);
		}
	}

	private lockControls() {
		let firstControls: PointerLockControls | undefined;
		this._controls_by_element_id.forEach((controls, id) => {
			firstControls = firstControls || controls;
		});
		if (!firstControls) {
			return;
		}
		firstControls.lock();
	}
	static PARAM_CALLBACK_lock_controls(node: FirstPersonControlsEventNode) {
		node.lockControls();
	}
	static PARAM_CALLBACK_recomputeCollidingGeo(node: FirstPersonControlsEventNode) {
		node._recomputeCollidingGeo();
	}
	private _recomputeCollidingGeo() {
		this._controls_by_element_id.forEach((controls, id) => {
			this._setupCollisionGeo(controls);
		});
	}
}
