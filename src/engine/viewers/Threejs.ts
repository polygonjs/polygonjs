import {PolyScene} from 'src/engine/scene/PolyScene';
import {Vector2} from 'three/src/math/Vector2';
// import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer'
// import {Color} from 'three/src/math/Color'

import {BaseViewer} from './_Base';
import {BaseCameraObjNodeType} from 'src/engine/nodes/obj/_BaseCamera';

import 'src/engine/Poly';

const CSS_CLASS = 'CoreThreejsViewer';

declare global {
	interface HTMLCanvasElement {
		onwebglcontextlost: () => void;
		onwebglcontextrestored: () => void;
	}
}

export class ThreejsViewer extends BaseViewer {
	private _request_animation_frame_id: number;
	private do_render: boolean = true;

	private _animate_method: () => void;

	constructor(_container: HTMLElement, protected _scene: PolyScene, camera_node: BaseCameraObjNodeType) {
		super(_container, _scene, camera_node);

		this._canvas = document.createElement('canvas');
		this._canvas.id = `canvas_id_${Math.random()}`.replace('.', '_');

		this._container.appendChild(this._canvas);
		this._container.classList.add(CSS_CLASS);

		this._set_events();
	}

	public _build() {
		this._init_display();
		this.activate();
		console.log('built');
	}

	dispose() {
		this._cancel_animate();
		this.controls_controller.dispose_controls();
		// this._dispose_graph_node()
	}

	private _set_events() {
		this.events_controller.init();
		this.webgl_controller.init();

		if (POLY.player_mode()) {
			window.onresize = this.cameras_controller.on_resize.bind(this);
		}
	}
	// protected _on_touchmove(event: TouchEvent){
	// 	console.log("touch", event)
	// }

	private _init_display() {
		this.cameras_controller.compute_size_and_aspect();
		const size: Vector2 = this.cameras_controller.size;

		this.cameras_controller.camera_node.post_process_controller.create_renderer(this._canvas, size);
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

		// this._init_ray_helper(); // TODO: typescript

		//@cam_animation_helper = new CameraAnimationHelper(@ray_helper, @event_helper)

		this.cameras_controller.prepare_current_camera();
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
		this.cameras_controller.camera_node.post_process_controller.delete_renderer(this._canvas);
		// POLY.renderers_controller.deregister_renderer(@renderer)
		// this.dispose_camera()
	}

	render() {
		if (this.cameras_controller.camera_node) {
			const size = this.cameras_controller.size;
			const aspect = this.cameras_controller.aspect;
			this.cameras_controller.camera_node.post_process_controller.render(this._canvas, size, aspect);

			// TODO: typescript
			// if (this._controls && this._controls.update) {
			// 	this._controls.update();
			// }

			// TODO: typescript
			// if (this._capturer) {
			// 	this._capturer.perform_capture();
			// }
		} else {
			console.warn('no camera to render with');
		}
	}
}
