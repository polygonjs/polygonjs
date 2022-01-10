import {Vector2} from 'three/src/math/Vector2';
import {ViewerControlsController} from './utils/ControlsController';
import {TypedViewer} from './_Base';
import {BaseThreejsCameraObjNodeType} from '../nodes/obj/_BaseCamera';
import {Clock} from 'three/src/core/Clock';

const CSS_CLASS = 'CoreThreejsViewer';

declare global {
	interface HTMLCanvasElement {
		onwebglcontextlost: () => void;
		onwebglcontextrestored: () => void;
	}
}

export interface ThreejsViewerProperties {
	autoRender?: boolean;
}

export class ThreejsViewer extends TypedViewer<BaseThreejsCameraObjNodeType> {
	private _request_animation_frame_id: number | undefined;
	private _doRender: boolean = true;
	private _clock = new Clock();
	private _delta: number = 0;

	private _animate_method: () => void = this.animate.bind(this);
	protected _canvasIdPrefix() {
		return 'ThreejsViewer';
	}
	constructor(protected _cameraNode: BaseThreejsCameraObjNodeType, private _properties?: ThreejsViewerProperties) {
		super(_cameraNode);

		this._doRender = this._properties != null ? this._properties.autoRender || true : true;

		// this._container.style.height = '100%'; // this should be app specific
	}
	mount(element: HTMLElement) {
		super.mount(element);
		this._domElement?.appendChild(this.canvas());
		this._domElement?.classList.add(CSS_CLASS);
		this._build();
		this._setEvents();
	}

	get controlsController(): ViewerControlsController {
		return (this._controls_controller = this._controls_controller || new ViewerControlsController(this));
	}

	public _build() {
		this._initDisplay();
		this.activate();
	}

	dispose() {
		this.scene().viewersRegister.unregisterViewer(this);
		this._cancel_animate();
		this.controlsController.dispose();
		this._disposeEvents();
		// TODO: also dispose the renderer
		super.dispose();
	}
	get cameraControlsController() {
		return this._cameraNode.controls_controller;
	}

	private _setEvents() {
		this.eventsController.init();
		this.webglController.init();

		window.addEventListener('resize', this._onResizeBound.bind(this), false);
	}
	private _disposeEvents() {
		window.removeEventListener('resize', this._onResizeBound.bind(this), false);
	}
	private _onResizeBound = this.onResize.bind(this);
	onResize() {
		const canvas = this._canvas;
		if (!canvas) {
			return;
		}
		this.camerasController.computeSizeAndAspect();
		this._cameraNode.renderController.set_renderer_size(canvas, this.camerasController.size);
		this.camerasController.updateCameraAspect();
	}

	private _initDisplay() {
		if (!this._canvas) {
			console.warn('no canvas found for viewer');
			return;
		}
		this.camerasController.computeSizeAndAspect();
		const size: Vector2 = this.camerasController.size;

		const controller = this._cameraNode.renderController;
		const existingRenderer = controller.renderer(this._canvas);
		if (!existingRenderer) {
			controller.createRenderer(this._canvas, size);
		}
		// this.canvas_context = canvas.getContext('2d')

		this.audioController().update();
		// init renderer
		// renderer = new THREE.WebGLRenderer
		// 	canvas: canvas
		// 	antialias: true
		// 	alpha: true

		// renderer.shadowMap.enabled = true
		// this.compute_size_and_aspect()

		//
		// https://stackoverflow.com/questions/31407778/display-scene-at-lower-resolution-in-three-js
		// TODO: this article mentions that setSize should be called after
		// renderer.setSize(this._size[0], this._size[1])
		// renderer.setPixelRatio(window.devicePixelRatio)
		// renderer.setSize(size[0]*1.5, size[1]*1.5)
		// canvas.width = "//{size[0]}px"
		// canvas.height = "//{size[1]}px"
		// canvas.style.width = "//{size[0]}px"
		// canvas.style.height = "//{size[1]}px"

		// TODO: ensure the renderers get added to a list
		//if !this.player_mode
		//	console.log("set window.viewer_renderer from Threejs.vue component")
		// window.viewer_renderer = renderer
		// POLY.renderers_controller.register_renderer(renderer)

		this.camerasController.prepareCurrentCamera();

		this.animate();
	}

	setAutoRender(state = true) {
		this._doRender = state;
		if (this._doRender) {
			this.animate();
		}
	}

	animate() {
		if (this._doRender) {
			const delta = this._clock.getDelta();
			this._delta = delta;
			this._request_animation_frame_id = requestAnimationFrame(this._animate_method);
			this._runOnBeforeTickCallbacks(delta);
			this._scene.timeController.incrementTimeIfPlaying(this._delta);
			this._runOnAfterTickCallbacks(delta);
			this.render(this._delta);
			this._controls_controller?.update(this._delta);
		}
	}

	private _cancel_animate() {
		this._doRender = false;
		if (this._request_animation_frame_id) {
			cancelAnimationFrame(this._request_animation_frame_id);
		}
		if (this._canvas) {
			this._cameraNode.renderController.deleteRenderer(this._canvas);
		}
	}

	render(delta: number) {
		if (this.camerasController.cameraNode() && this._canvas) {
			const delta = this._delta;
			this._runOnBeforeRenderCallbacks(delta);

			const size = this.camerasController.size;
			const aspect = this.camerasController.aspect;
			this._cameraNode.renderController.render(this._canvas, size, aspect, this._renderObjectOverride);

			this._runOnAfterRenderCallbacks(delta);
		} else {
			console.warn('no camera to render with');
		}
	}

	renderer() {
		if (this._canvas) {
			return this._cameraNode.renderController.renderer(this._canvas);
		}
	}
}
