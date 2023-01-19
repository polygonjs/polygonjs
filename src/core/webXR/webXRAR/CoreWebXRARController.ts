import {Vector3, Matrix4, Quaternion, WebGLRenderer, Camera, Color, Texture} from 'three';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {CoreARButton} from '../buttons/CoreARButton';
import {CoreWebXRARControllerOptions} from './CommonAR';
import {CoreWebXRAREstimatedLightController} from './CoreWebXRAREstimatedLightController';
import {BaseCoreWebXRController, OnWebXRSessionStartedCallback} from '../_BaseCoreWebXRController';
// import {CoreWebXRARCaptureController} from './CoreWebXRARCapture';

const s = new Vector3();

export class CoreWebXRARController extends BaseCoreWebXRController {
	private hitTestSource: XRHitTestSource | null = null;
	private hitTestSourceRequested = false;
	private _hitDetected = false;
	private _hitMatrix = new Matrix4();
	private _hitPosition = new Vector3();
	private _hitQuaternion = new Quaternion();
	// public readonly capture: CoreWebXRARCaptureController;
	constructor(
		scene: PolyScene,
		renderer: WebGLRenderer,
		camera: Camera,
		canvas: HTMLCanvasElement,
		protected override options: CoreWebXRARControllerOptions
	) {
		super(scene, renderer, camera, canvas, options);
		// this.capture = new CoreWebXRARCaptureController(renderer);
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
				// trackedImages: [
				// 	{
				// 		image: ,
				// 		widthInMeters: 0.2,
				// 	},
				// ],
			}
		);
	}
	attachButton(parentElement: HTMLElement, buttonElement: HTMLElement) {
		parentElement.prepend(buttonElement);
	}

	override async requestSession(sessionInit: XRSessionInit, onSessionStarted: OnWebXRSessionStartedCallback) {
		super.requestSession(sessionInit, onSessionStarted);
		this._estimatedLightController = new CoreWebXRAREstimatedLightController();
		this._estimatedLightController.initialize(this.scene, this.renderer);

		return navigator.xr?.requestSession('immersive-ar', sessionInit).then(async (session) => {
			// await this.capture.init(session);

			onSessionStarted(session);
		});
	}
	private _estimatedLightController: CoreWebXRAREstimatedLightController | undefined;
	private _previousSceneBackground: Color | Texture | null = null;
	protected override _onSessionStart() {
		// set active before super._onSessionStart
		// so that actor nodes can listen to the active xr manager
		this.scene.webXR.setActiveARController(this);
		this._previousSceneBackground = this.scene.threejsScene().background;
		this.scene.threejsScene().background = null;

		super._onSessionStart();
	}
	protected override _onSessionEnd() {
		this.scene.webXR.setActiveARController(null);
		this._estimatedLightController?.dispose();
		this.scene.threejsScene().background = this._previousSceneBackground;
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
		if (!frame) {
			return;
		}
		const referenceSpace = this.renderer.xr.getReferenceSpace();
		const session = this.renderer.xr.getSession();
		if (!(session && referenceSpace)) {
			return;
		}
		this._resolveHit(frame, session, referenceSpace);
		// this.capture.process(frame, referenceSpace);
	}

	private _resolveHit(frame: XRFrame, session: XRSession, referenceSpace: XRReferenceSpace) {
		if (!frame) {
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
