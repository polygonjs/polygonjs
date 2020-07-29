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

export class ThreejsViewer extends TypedViewer<BaseThreejsCameraObjNodeType> {
	private _request_animation_frame_id: number | undefined;
	private do_render: boolean = true;

	private _animate_method: () => void = this.animate.bind(this);

	constructor(
		_container: HTMLElement,
		protected _scene: PolyScene,
		protected _camera_node: BaseThreejsCameraObjNodeType
	) {
		super(_container, _scene, _camera_node);

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
	get controls_controller(): ViewerControlsController {
		return (this._controls_controller = this._controls_controller || new ViewerControlsController(this));
	}

	public _build() {
		this._init_display();
		this.activate();
	}

	dispose() {
		this._cancel_animate();
		this.controls_controller.dispose();
		// TODO: also dispose the renderer
		super.dispose();
	}
	get camera_controls_controller() {
		return this._camera_node.controls_controller;
	}

	private _set_events() {
		this.events_controller.init();
		this.webgl_controller.init();

		window.onresize = () => {
			this.on_resize();
		};
	}
	on_resize() {
		if (!this.canvas) {
			return;
		}
		this.cameras_controller.compute_size_and_aspect();
		this._camera_node.render_controller.set_renderer_size(this.canvas, this.cameras_controller.size);
		this.cameras_controller.update_camera_aspect();
	}

	private _init_display() {
		if (!this._canvas) {
			console.warn('no canvas found for viewer');
			return;
		}
		this.cameras_controller.compute_size_and_aspect();
		const size: Vector2 = this.cameras_controller.size;

		this._camera_node.render_controller.create_renderer(this._canvas, size);
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

		this.cameras_controller.prepare_current_camera();

		this.animate();
	}

	animate() {
		if (this.do_render) {
			this._scene.time_controller.increment_time_if_playing();
			this.render();
			this._controls_controller?.update();
			this._request_animation_frame_id = requestAnimationFrame(this._animate_method);
		}
	}

	private _cancel_animate() {
		this.do_render = false;
		if (this._request_animation_frame_id) {
			cancelAnimationFrame(this._request_animation_frame_id);
		}
		if (this._canvas) {
			this._camera_node.render_controller.delete_renderer(this._canvas);
		}
	}

	render() {
		if (this.cameras_controller.camera_node && this._canvas) {
			const size = this.cameras_controller.size;
			const aspect = this.cameras_controller.aspect;
			this._camera_node.render_controller.render(this._canvas, size, aspect);
		} else {
			console.warn('no camera to render with');
		}
	}
}
