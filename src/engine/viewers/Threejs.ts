import {PolyScene} from 'src/engine/scene/PolyScene';
// import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer'
// import {Color} from 'three/src/math/Color'

import {BaseViewer} from './_Base';
import {BaseCamera} from 'src/engine/nodes/obj/_BaseCamera';
import {ViewerLoader} from './Loader';

import 'src/engine/Poly';

const CSS_CLASS = 'CoreThreejsViewer';

declare global {
	interface HTMLCanvasElement {
		onwebglcontextlost: () => void;
		onwebglcontextrestored: () => void;
	}
}

export class ThreejsViewer extends BaseViewer {
	private _canvas: HTMLCanvasElement;
	private _request_animation_frame_id: number;
	private do_render: boolean = true;

	protected _bound_on_mousedown: (e: MouseEvent) => void;
	protected _bound_on_mousemove: (e: MouseEvent) => void;
	protected _bound_on_click: (e: MouseEvent) => void;
	protected _bound_on_mouseup: (e: MouseEvent) => void;

	private _animate_method: () => void;

	constructor(_element: HTMLElement, protected _scene: PolyScene, camera_node: BaseCamera) {
		super(_element, _scene, camera_node);

		this._canvas = document.createElement('canvas');
		this._canvas.id = `canvas_id_${Math.random()}`.replace('.', '_');

		this._element.appendChild(this._canvas);
		this._element.classList.add(CSS_CLASS);

		new ViewerLoader(this._element);

		this._set_events();
	}
	canvas(): HTMLCanvasElement {
		return this._canvas;
	}

	protected _build() {
		this._init_display();
		this._init_active();
	}

	dispose() {
		this._cancel_animate();
		this._dispose_controls();
		// this._dispose_graph_node()
	}

	private _set_events() {
		this._set_mouse_events();
		this._canvas.onwebglcontextlost = this._on_webglcontextlost.bind(this);
		this._canvas.onwebglcontextrestored = this._on_webglcontextrestored.bind(this);

		if (POLY.player_mode()) {
			window.onresize = this.on_resize.bind(this);
		}
	}

	protected _set_mouse_events() {
		if (this._bound_on_mousedown) {
			this._canvas.removeEventListener('mousedown', this._bound_on_mousedown);
		}
		if (this._bound_on_mousemove) {
			this._canvas.removeEventListener('mousemove', this._bound_on_mousemove);
		}
		if (this._bound_on_click) {
			this._canvas.removeEventListener('mouseup', this._bound_on_click);
		}
		this._bound_on_mousedown = this._bound_on_mousedown || this._on_mousedown.bind(this);
		this._bound_on_mousemove = this._bound_on_mousemove || this._on_mousemove.bind(this);
		this._bound_on_mouseup = this._bound_on_mouseup || this._on_mouseup.bind(this);

		this._canvas.addEventListener('mousedown', this._bound_on_mousedown);
		this._canvas.addEventListener('mousemove', this._bound_on_mousemove);
		this._canvas.addEventListener('mouseup', this._bound_on_mouseup);

		// this._bound_on_touchmove = this._bound_on_touchmove || this._on_touchmove.bind(this)
		this._canvas.addEventListener('touchstart', this._bound_on_mousedown, false);
		this._canvas.addEventListener('touchmove', this._bound_on_mousemove, false);
		this._canvas.addEventListener('touchend', this._bound_on_mouseup, false);
		this._canvas.addEventListener('touchcancel', this._bound_on_mouseup, false);
	}
	// protected _on_touchmove(event: TouchEvent){
	// 	console.log("touch", event)
	// }

	private _init_display() {
		this._compute_size_and_aspect();

		this._camera_node.create_renderer(this._canvas, this._size);
		// this.canvas_context = canvas.getContext('2d')

		// init renderer
		// @renderer = new THREE.WebGLRenderer
		// 	canvas: canvas
		// 	antialias: true
		// 	alpha: true

		// @renderer.shadowMap.enabled = true
		// this.compute_size_and_aspect()

		//
		// https://stackoverflow.com/questions/31407778/display-scene-at-lower-resolution-in-three-js
		// TODO: this article mentions that setSize should be called after
		// @renderer.setSize(this._size[0], this._size[1])
		// @renderer.setPixelRatio(window.devicePixelRatio)
		// @renderer.setSize(size[0]*1.5, size[1]*1.5)
		// canvas.width = "//{size[0]}px"
		// canvas.height = "//{size[1]}px"
		// canvas.style.width = "//{size[0]}px"
		// canvas.style.height = "//{size[1]}px"

		// TODO: ensure the renderers get added to a list
		//if !this.player_mode
		//	console.log("set window.viewer_renderer from Threejs.vue component")
		// window.viewer_renderer = @renderer
		// POLY.renderers_controller.register_renderer(@renderer)

		//this._init_webgl_utils()

		// init scene
		// @display_scene.background = new THREE.Color("//111")

		//window.display_scene = @display_scene

		this._init_ray_helper();

		//@cam_animation_helper = new CameraAnimationHelper(@ray_helper, @event_helper)

		this.prepare_current_camera();
		// this._add_helpers_to_scene()

		this._animate_method = this.animate.bind(this);
		this.animate();
	}

	animate() {
		if (this.do_render) {
			this.render();
			// this.update_stats()
			// this._controls?.update(false)

			// @_renders_count ?= 0
			// @_renders_count += 1
			// if @_renders_count < 6
			this._request_animation_frame_id = requestAnimationFrame(this._animate_method);
		}
	}

	private _cancel_animate() {
		this.do_render = false;
		cancelAnimationFrame(this._request_animation_frame_id);
		this._camera_node.delete_renderer(this._canvas);
		// POLY.renderers_controller.deregister_renderer(@renderer)
		// this.dispose_camera()
	}

	render() {
		if (this._camera_node) {
			this._camera_node.render(this._canvas, this._size, this._aspect);

			if (this._controls && this._controls.update) {
				this._controls.update();
			}

			if (this._capturer) {
				this._capturer.perform_capture();
			}
		} else {
			console.warn('no camera to render with');
		}
	}
}
