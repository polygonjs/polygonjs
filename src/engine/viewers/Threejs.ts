import {Vector2} from 'three';
import {ViewerControlsController} from './utils/ControlsController';
import {TypedViewer} from './_Base';
import {BaseThreejsCameraObjNodeType} from '../nodes/obj/_BaseCamera';
import {Poly} from '../Poly';
import {ViewerLogoController} from './utils/logo/ViewerLogoController';
import {TIME_CONTROLLER_UPDATE_TIME_OPTIONS_DEFAULT} from '../scene/utils/TimeController';
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

/**
 * threejs viewers are created by the [PerspectiveCamera](/docs/nodes/obj/perspectivecamera) and [OrthographicCamera](/docs/nodes/obj/orthographiccamera) object nodes. They inherit from [TypedViewer](/docs/api/TypedViewer).
 *
 */
export class ThreejsViewer extends TypedViewer<BaseThreejsCameraObjNodeType> {
	private _requestAnimationFrameId: number | undefined;
	private _doRender: boolean = true;

	private _animateMethod: () => void = this.animate.bind(this);
	protected override _canvasIdPrefix() {
		return 'ThreejsViewer';
	}
	constructor(
		protected override _cameraNode: BaseThreejsCameraObjNodeType,
		private _properties?: ThreejsViewerProperties
	) {
		super(_cameraNode);

		this._doRender = true;
		if (this._properties != null && this._properties.autoRender != null) {
			this._doRender = this._properties.autoRender;
		}

		// this._container.style.height = '100%'; // this should be app specific
	}
	/**
	 * mounts the viewer onto an element
	 *
	 *
	 */
	override mount(element: HTMLElement) {
		super.mount(element);
		this._domElement?.appendChild(this.canvas());
		this._domElement?.classList.add(CSS_CLASS);
		this._build();
		this._setEvents();

		if (Poly.logo.displayed()) {
			new ViewerLogoController(this);
		}
	}

	override controlsController(): ViewerControlsController {
		return (this._controlsController = this._controlsController || new ViewerControlsController(this));
	}

	public _build() {
		this._initDisplay();
		this.activate();
	}

	/**
	 * disposes the viewer
	 *
	 *
	 */
	override dispose() {
		this.setAutoRender(false);
		this.scene().viewersRegister.unregisterViewer(this);
		this._cancelAnimate();
		this.controlsController().dispose();
		this._disposeEvents();
		// TODO: also dispose the renderer
		super.dispose();
	}
	override cameraControlsController() {
		return this._cameraNode.controlsController();
	}

	private _setEvents() {
		this.eventsController().init();
		this.webglController().init();

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
		this.camerasController().computeSizeAndAspect();
		this._cameraNode.renderController().setRendererSize(canvas, this.camerasController().size);
		this.camerasController().updateCameraAspect();
	}

	private _initDisplay() {
		if (!this._canvas) {
			console.warn('no canvas found for viewer');
			return;
		}
		this.camerasController().computeSizeAndAspect();
		const size: Vector2 = this.camerasController().size;

		const controller = this._cameraNode.renderController();
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

		this.camerasController().prepareCurrentCamera();

		this.animate();
	}

	/**
	 * setAutoRender to false will stop the rendering. This can be useful if you know that nothing has changed in the scene, or if the renderer is currently not visible.
	 *
	 *
	 */
	setAutoRender(state = true) {
		this._doRender = state;
		if (this._doRender) {
			this.animate();
		}
	}
	autoRenderState(): boolean {
		return this._doRender;
	}

	animate() {
		if (this._doRender) {
			const delta = this._scene.timeController.updateClockDelta();
			this._requestAnimationFrameId = requestAnimationFrame(this._animateMethod);
			this._runOnBeforeTickCallbacks(delta);
			// this._scene.eventsDispatcher.connectionTriggerDispatcher.reset();
			this._scene.timeController.incrementTimeIfPlaying(TIME_CONTROLLER_UPDATE_TIME_OPTIONS_DEFAULT);
			this._runOnAfterTickCallbacks(delta);
			this.render(delta);
			this.controlsController()?.update(delta);
		}
	}

	private _cancelAnimate() {
		this._doRender = false;
		if (this._requestAnimationFrameId) {
			cancelAnimationFrame(this._requestAnimationFrameId);
		}
		if (this._canvas) {
			this._cameraNode.renderController().deleteRenderer(this._canvas);
		}
	}

	render(delta: number) {
		if (this._canvas) {
			const renderController = this._cameraNode.renderController();
			const renderer = renderController.getRenderer(this._canvas);
			if (!renderer) {
				return;
			}
			this._runOnBeforeRenderCallbacks(delta, renderer);

			const size = this.camerasController().size;
			const aspect = this.camerasController().aspect;
			renderController.render(this._canvas, size, aspect, this._renderObjectOverride);

			this._runOnAfterRenderCallbacks(delta, renderer);
		} else {
			console.warn('no canvas to render onto');
		}
	}

	/**
	 * returns the current renderer
	 *
	 *
	 */
	renderer() {
		if (this._canvas) {
			return this._cameraNode.renderController().renderer(this._canvas);
		}
	}
	preCompile() {
		if (this._canvas) {
			this._cameraNode.renderController().preCompile(this._canvas);
		}
	}
	override markAsReady() {
		this.preCompile();
		this.setAutoRender(true);
	}
}
