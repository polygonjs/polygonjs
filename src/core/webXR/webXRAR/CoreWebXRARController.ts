import {Vector3, Matrix4, Quaternion, WebGLRenderer, Camera} from 'three';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {CoreARButton} from '../buttons/CoreARButton';
import {CoreWebXRARControllerOptions} from './CommonAR';
import {CoreWebXRAREstimatedLightController} from './CoreWebXRAREstimatedLightController';
import {BaseCoreWebXRController, OnWebXRSessionStartedCallback} from '../_BaseCoreWebXRController';

const s = new Vector3();

export class CoreWebXRARController extends BaseCoreWebXRController {
	private hitTestSource: XRHitTestSource | null = null;
	private hitTestSourceRequested = false;
	private _hitDetected = false;
	private _hitMatrix = new Matrix4();
	private _hitPosition = new Vector3();
	private _hitQuaternion = new Quaternion();
	constructor(
		scene: PolyScene,
		renderer: WebGLRenderer,
		camera: Camera,
		canvas: HTMLCanvasElement,
		protected options: CoreWebXRARControllerOptions
	) {
		super(scene, renderer, camera, canvas);
	}

	createButton(): HTMLElement {
		return CoreARButton.createButton(
			{
				renderer: this.renderer,
				controller: this,
			},
			{
				optionalFeatures: this.options.optionalFeatures,
				requiredFeatures: this.options.requiredFeatures,
			}
		);
	}
	async requestSession(sessionInit: XRSessionInit, onSessionStarted: OnWebXRSessionStartedCallback) {
		this._estimatedLightController = new CoreWebXRAREstimatedLightController();
		this._estimatedLightController.initialize(this.scene, this.renderer);
		return navigator.xr?.requestSession('immersive-ar', sessionInit).then(onSessionStarted);
	}
	private _estimatedLightController: CoreWebXRAREstimatedLightController | undefined;
	protected override _onSessionStart() {
		// set active before super._onSessionStart
		// so that actor nodes can listen to the active xr manager
		this.scene.webXR.setActiveARController(this);
		super._onSessionStart();
	}
	protected override _onSessionEnd() {
		this.scene.webXR.setActiveARController(null);
		this._estimatedLightController?.dispose();
		super._onSessionEnd();
	}

	hitMatrix(target: Matrix4) {
		target.copy(this._hitMatrix);
	}
	hitPosition(target: Vector3) {
		target.copy(this._hitPosition);
	}
	hitQuaternion(target: Quaternion) {
		target.copy(this._hitQuaternion);
	}
	hitDetected() {
		return this._hitDetected;
	}

	override process(frame?: XRFrame) {
		super.process(frame);
		this._resolveHit(frame);
	}
	private _resolveHit(frame?: XRFrame) {
		if (!frame) {
			return;
		}
		const referenceSpace = this.renderer.xr.getReferenceSpace();
		const session = this.renderer.xr.getSession();
		if (!(session && referenceSpace)) {
			return;
		}

		if (this.hitTestSourceRequested === false) {
			session.requestReferenceSpace('viewer').then((referenceSpace) => {
				if (!session.requestHitTestSource) {
					return;
				}
				session.requestHitTestSource({space: referenceSpace})?.then((source) => {
					this.hitTestSource = source;
				});
			});

			session.addEventListener('end', () => {
				this.hitTestSourceRequested = false;
				this.hitTestSource = null;
			});

			this.hitTestSourceRequested = true;
		}

		if (!this.hitTestSource) {
			return;
		}

		const hitTestResults = frame.getHitTestResults(this.hitTestSource);
		if (hitTestResults.length) {
			const hit = hitTestResults[0];
			const pose = hit.getPose(referenceSpace);
			if (pose) {
				this._hitDetected = true;
				this._hitMatrix.fromArray(pose.transform.matrix);
				this._hitMatrix.decompose(this._hitPosition, this._hitQuaternion, s);
				return;
			}
		}
		this._hitDetected = false;
	}
}
