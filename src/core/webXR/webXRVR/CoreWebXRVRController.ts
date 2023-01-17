import {
	WebGLRenderer,
	BufferGeometry,
	Float32BufferAttribute,
	AdditiveBlending,
	LineBasicMaterial,
	Line,
	RingGeometry,
	MeshBasicMaterial,
	Mesh,
	Object3D,
	Camera,
} from 'three';
import {PolyScene} from '../../../engine/scene/PolyScene';
import {CoreVRButton} from '../buttons/CoreVRButton';
import {CoreWebXRVRControllerOptions} from './CommonVR';
import {CoreWebXRControllerContainer} from '../CoreWebXRControllerContainer';
import {BaseCoreWebXRController, OnWebXRSessionStartedCallback} from '../_BaseCoreWebXRController';

// from three
// examples/webxr_vr_ballshooter.html

function buildController(data: XRInputSource) {
	let geometry, material;

	switch (data.targetRayMode) {
		case 'tracked-pointer':
			geometry = new BufferGeometry();
			geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3));
			geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));

			material = new LineBasicMaterial({vertexColors: true, blending: AdditiveBlending});

			return new Line(geometry, material);

		case 'gaze':
			geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
			material = new MeshBasicMaterial({opacity: 0.5, transparent: true});
			return new Mesh(geometry, material);
	}
}

export class CoreWebXRVRController extends BaseCoreWebXRController {
	private _baseReferenceSpace: XRReferenceSpace | null = null;
	constructor(
		scene: PolyScene,
		renderer: WebGLRenderer,
		camera: Camera,
		canvas: HTMLCanvasElement,
		protected override options: CoreWebXRVRControllerOptions
	) {
		super(scene, renderer, camera, canvas, options);
	}
	override mount() {
		super.mount();
		// this.scene.webXR.setVRController(this);

		const xr = this.renderer.xr;
		xr.addEventListener('sessionstart', () => (this._baseReferenceSpace = xr.getReferenceSpace()));
	}
	async requestSession(sessionInit: XRSessionInit, onSessionStarted: OnWebXRSessionStartedCallback) {
		return navigator.xr?.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
	}
	protected override _onSessionStart() {
		// set active before super._onSessionStart
		// so that actor nodes can listen to the active xr manager
		this.scene.webXR.setActiveVRController(this);
		super._onSessionStart();
	}
	protected override _onSessionEnd() {
		this.scene.webXR.setActiveVRController(null);
		super._onSessionEnd();
	}
	baseReferenceSpace() {
		return this._baseReferenceSpace;
	}
	setReferenceSpace(referenceSpace: XRReferenceSpace) {
		this.renderer.xr.setReferenceSpace(referenceSpace);
	}

	protected override _addControllerEvents(
		controllerContainer: CoreWebXRControllerContainer,
		controllerIndex: number
	): void {
		let controllerChild: Object3D | undefined;
		// add/remove crosshair to controller
		controllerContainer.controller.addEventListener('connected', function (event) {
			const data: XRInputSource = event.data;
			const _controllerChild = buildController(data);
			if (_controllerChild) {
				controllerChild = _controllerChild;
				controllerChild.name = `VR-eye-target-${controllerIndex}`;
				controllerContainer.controller.add(controllerChild);
			}
		});
		controllerContainer.controller.addEventListener('disconnected', function () {
			if (controllerChild) {
				controllerContainer.controller.remove(controllerChild);
			}
		});
	}

	createButton() {
		return CoreVRButton.createButton(
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
	attachButton(parentElement: HTMLElement, buttonElement: HTMLElement) {
		parentElement.append(buttonElement);
	}
}
