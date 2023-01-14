import {Vector3, Matrix4, Quaternion, WebGLRenderer, Camera, Color, Texture} from 'three';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {CoreARButton} from '../buttons/CoreARButton';
import {CoreWebXRARControllerOptions, ExtentedXRView, ExtentedXRViewCamera, ExtendedXRWebGLBinding} from './CommonAR';
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

	async requestSession(sessionInit: XRSessionInit, onSessionStarted: OnWebXRSessionStartedCallback) {
		this._estimatedLightController = new CoreWebXRAREstimatedLightController();
		this._estimatedLightController.initialize(this.scene, this.renderer);

		return navigator.xr?.requestSession('immersive-ar', sessionInit).then(async (session) => {
			await this._initForCapture(session);

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
		this._resolveCapture(frame, session, referenceSpace);
	}
	private _captureLocalReferenceSpace: XRReferenceSpace | XRBoundedReferenceSpace | undefined;
	private _captureNext: boolean = false;
	private _captureGlBinding: ExtendedXRWebGLBinding | undefined;
	private _captureGlContext: WebGLRenderingContext | WebGL2RenderingContext | undefined;
	private async _initForCapture(session: XRSession) {
		this._captureGlContext = this.renderer.getContext();
		await this._captureGlContext.makeXRCompatible();
		// could lead to race condition
		// initCameraCaptureScene(gl);
		this._captureGlBinding = new XRWebGLBinding(session, this._captureGlContext) as ExtendedXRWebGLBinding;
		session.requestReferenceSpace('local').then((refSpace) => {
			this._captureLocalReferenceSpace = refSpace;
		});
		setTimeout(() => {
			console.log('set true');
			this._captureNext = true;
		}, 1000);
	}
	private _resolveCapture(frame: XRFrame, session: XRSession, referenceSpace: XRReferenceSpace) {
		// session.requestReferenceSpace('local').then((referenceSpace) => {
		// 	if (!session.requestHitTestSource) {
		// 		return;
		// 	}
		// 	session.requestHitTestSource({space: referenceSpace})?.then((source) => {
		// 		this.hitTestSource = source;
		// 	});
		// });
		// session.requestReferenceSpace("local").then((refSpace) => {
		// 	this._captureLocalReferenceSpace = refSpace;
		//   });

		if (!(this._captureLocalReferenceSpace && this._captureGlContext && this._captureGlBinding)) {
			return;
		}
		const pose = frame.getViewerPose(this._captureLocalReferenceSpace);
		if (!pose) {
			return;
		}
		const baseLayer = session.renderState.baseLayer;
		if (!baseLayer) {
			return;
		}
		const views = pose.views as ExtentedXRView[];
		console.log(views);
		let dcamera: ExtentedXRViewCamera | undefined;
		for (const view of views) {
			const viewport = baseLayer.getViewport(view);
			if (viewport) {
				this._captureGlContext.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
				if (view.camera && this._captureNext) {
					this._captureNext = false;
					dcamera = view.camera;
					const camBinding = this._captureGlBinding.getCameraImage(dcamera);
					console.log(camBinding);
					// texture1 = drawCameraCaptureScene(
					// 	this._captureGlContext,
					//   camBinding,
					//   dcamera.width,
					//   dcamera.height
					// );

					// whratio = viewport.width / viewport.height;
					// scaleGeo = 2 * Math.tan((2 * Math.PI * camera.fov) / (2 * 360));
					// const geometry = new THREE.PlaneGeometry(
					//   scaleGeo,
					//   scaleGeo * whratio,
					//   1,
					//   1
					// );
					// const vertices = geometry.attributes.position.array;

					// const mesh = new THREE.Mesh(geometry, new THREE.ShaderMaterial());
					// mesh.material = new THREE.ShaderMaterial({
					//   uniforms: {
					//     uSampler: {
					//       value: new THREE.DataTexture(
					//         texture1,
					//         dcamera.width,
					//         dcamera.height
					//       )
					//     },
					//     coordTrans: {
					//       value: {
					//         x: 1 / viewport.width,
					//         y: 1 / viewport.height
					//       }
					//     }
					//   },
					//   vertexShader: document.getElementById("vertexShader").textContent,
					//   fragmentShader: document.getElementById("fragmentShader").textContent
					// });

					// mesh.quaternion.copy(camera.quaternion);
					// mesh.position.copy(camera.position);
					// mesh.position.add(
					//   new THREE.Vector3(0, 0, -0.4).applyQuaternion(camera.quaternion)
					// );
					// mesh.rotateZ((3 * Math.PI) / 2);
					// // mesh.material.wireframe = true
					// scene.add(mesh);
				} else {
					console.log('unavailable');
				}
			}
		}
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
