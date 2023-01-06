import {
	WebGLRenderer,
	Ray,
	BufferGeometry,
	Float32BufferAttribute,
	AdditiveBlending,
	LineBasicMaterial,
	Line,
	RingGeometry,
	MeshBasicMaterial,
	Mesh,
	Object3D,
} from 'three';
import {VRButton} from 'three/examples/jsm/webxr/VRButton';
import {PolyScene} from '../../engine/scene/PolyScene';
import {CoreXRControllerContainer} from './CoreXRControllerContainer';
import {BaseCoreXRController} from './_BaseCoreXRController';

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

export class CoreVRController extends BaseCoreXRController {
	// private hitTestSource: XRHitTestSource | null = null;
	// private hitTestSourceRequested = false;
	protected ray0: Ray;
	protected ray1: Ray;
	protected rays: Ray[];
	private _baseReferenceSpace: XRReferenceSpace | null = null;
	constructor(scene: PolyScene, renderer: WebGLRenderer, canvas: HTMLCanvasElement) {
		super(scene, renderer, canvas);
		this.ray0 = new Ray();
		this.ray1 = new Ray();
		this.rays = [this.ray0, this.ray1];
	}
	override mount() {
		super.mount();
		this.scene.xr.setVRController(this);

		const xr = this.renderer.xr;
		xr.addEventListener('sessionstart', () => (this._baseReferenceSpace = xr.getReferenceSpace()));
	}
	protected controllerName(controllerIndex: number): string {
		return `VR-Controller-${controllerIndex}`;
	}
	baseReferenceSpace() {
		return this._baseReferenceSpace;
	}
	setReferenceSpace(referenceSpace: XRReferenceSpace) {
		this.renderer.xr.setReferenceSpace(referenceSpace);
	}

	protected override _addControllerEvents(
		controllerContainer: CoreXRControllerContainer,
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
		return VRButton.createButton(this.renderer);
	}
}
