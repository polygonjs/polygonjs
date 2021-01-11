import {PolyScene} from '../scene/PolyScene';
import {Vector2} from 'three/src/math/Vector2';
import {ViewerControlsController} from './utils/ControlsController';
import {TypedViewer} from './_Base';
import {BaseThreejsCameraObjNodeType} from '../nodes/obj/_BaseCamera';

const CSS_CLASS = 'CoreThreejsViewer';

declare global {
	interface HTMLCanvasElement {
		onwebglcontextlost: () => void;
		onwebglcontextrestored: () => void;
	}
}

export interface ThreejsViewerProperties {
	autoRender: boolean;
}

export class ThreejsViewer extends TypedViewer<BaseThreejsCameraObjNodeType> {
	private _request_animation_frame_id: number | undefined;
	private _do_render: boolean = true;

	private _animate_method: () => void = this.animate.bind(this);

	constructor(
		_container: HTMLElement,
		protected _scene: PolyScene,
		protected _camera_node: BaseThreejsCameraObjNodeType,
		private _properties?: ThreejsViewerProperties
	) {
		super(_container, _scene, _camera_node);

		this._do_render = this._properties != null ? this._properties.autoRender : true;

		this._canvas = document.createElement('canvas');
		this._canvas.id = `canvas_id_${Math.random()}`.replace('.', '_');
		this._canvas.style.display = 'block';
		this._canvas.style.outline = 'none';

		this._container.appendChild(this._canvas);
		this._container.classList.add(CSS_CLASS);
		// this._container.style.height = '100%'; // this should be app specific

		this._build();
		this._set_events();
	}
	get controlsController(): ViewerControlsController {
		return (this._controls_controller = this._controls_controller || new ViewerControlsController(this));
	}

	public _build() {
		this._init_display();
		this.activate();
	}

	dispose() {
		this._cancel_animate();
		this.controlsController.dispose();
		// TODO: also dispose the renderer
		super.dispose();
	}
	get cameraControlsController() {
		return this._camera_node.controls_controller;
	}

	private _set_events() {
		this.eventsController.init();
		this.webglController.init();

		window.onresize = () => {
			this.onResize();
		};
	}
	onResize() {
		const canvas = this.canvas();
		if (!canvas) {
			return;
		}
		this.camerasController.computeSizeAndAspect();
		this._camera_node.renderController.set_renderer_size(canvas, this.camerasController.size);
		this.camerasController.updateCameraAspect();
	}

	private _init_display() {
		if (!this._canvas) {
			console.warn('no canvas found for viewer');
			return;
		}
		this.camerasController.computeSizeAndAspect();
		const size: Vector2 = this.camerasController.size;

		this._camera_node.renderController.createRenderer(this._canvas, size);
		// this.canvas_context = canvas.getContext('2d')

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
		this._do_render = state;
		if (this._do_render) {
			this.animate();
		}
	}

	animate() {
		if (this._do_render) {
			this._request_animation_frame_id = requestAnimationFrame(this._animate_method);
			this._scene.timeController.increment_time_if_playing();
			this.render();
			this._controls_controller?.update();
		}
	}

	private _cancel_animate() {
		this._do_render = false;
		if (this._request_animation_frame_id) {
			cancelAnimationFrame(this._request_animation_frame_id);
		}
		if (this._canvas) {
			this._camera_node.renderController.delete_renderer(this._canvas);
		}
	}

	render() {
		if (this.camerasController.cameraNode && this._canvas) {
			const size = this.camerasController.size;
			const aspect = this.camerasController.aspect;
			this._camera_node.renderController.render(this._canvas, size, aspect);
		} else {
			console.warn('no camera to render with');
		}
	}

	renderer() {
		if (this._canvas) {
			return this._camera_node.renderController.renderer(this._canvas);
		}
	}
}
