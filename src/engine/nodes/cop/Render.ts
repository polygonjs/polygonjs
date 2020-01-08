// import lodash_uniq from "lodash/uniq";
// import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
// import { Vector2 } from "three/src/math/Vector2";
// import { Texture } from "three/src/textures/Texture";
// import { Scene } from "three/src/scenes/Scene";
// import { RGBFormat } from "three/src/constants";
// import { NearestFilter } from "three/src/constants";
// import { DataTexture } from "three/src/textures/DataTexture";
// import { Camera } from "three/src/cameras/Camera";
// const THREE = {
// 	Camera,
// 	DataTexture,
// 	NearestFilter,
// 	RGBFormat,
// 	Scene,
// 	Texture,
// 	Vector2,
// 	WebGLRenderer
// };
// // import NodeBase from '../_Base'

// // import Container from '../../Container/Texture'

// import { BaseNodeCop } from "./_Base";
// import { BaseCameraNode } from "src/Engine/Node/Obj/_BaseCamera";
// // import Walker from 'src/Core/Walker'
// import { ParamType } from "src/Engine/Param/_Module";

// export class Render extends BaseNodeCop {
// 	static type() {
// 		return "render";
// 	}

// 	private renderer: THREE.WebGLRenderer;
// 	private texture: THREE.Texture = new THREE.Texture();
// 	// private dpr: number = window.devicePixelRatio
// 	private camera: THREE.Camera;
// 	private do_render: boolean = true;
// 	private request_animation_frame_id: number;
// 	private animated_started: boolean = false;
// 	private animate_method: () => void;
// 	private previous_render_timestamp: number;
// 	private fps_interval: number;
// 	private _display_scene: THREE.Scene;
// 	private _aspect: number;
// 	private _camera_node: BaseCameraNode;

// 	constructor() {
// 		super();

// 		this.set_inputs_count_to_zero(0);

// 		this.animate_method = this.animate.bind(this);
// 		this.fps_interval = 1000 / 30; //(30fps)
// 	}

// 	create_params() {
// 		this.add_param(
// 			ParamType.OPERATOR_PATH,
// 			"camera",
// 			"/perspective_camera1"
// 		);
// 		this.add_param(ParamType.VECTOR2, "resolution", [256, 256]);
// 		this.add_param(ParamType.BUTTON, "update", "", {
// 			callback: () => this.set_dirty()
// 		});
// 	}

// 	async cook() {
// 		this._display_scene = this.scene().display_scene();
// 		this.renderer = this.renderer || this.create_renderer();
// 		// this.texture = this.texture || this.create_texture(this._param_resolution)
// 		this._aspect = this._param_resolution.x / this._param_resolution.y;
// 		this.renderer.setSize(
// 			this._param_resolution.x,
// 			this._param_resolution.y
// 		);

// 		this._camera_node = this.param("camera").found_node();
// 		// Walker.find_node(<unknown>this as Node, this._param_camera)
// 		if (this._camera_node) {
// 			this.camera = this._camera_node.object();
// 			const container = await this._camera_node.request_container_p();
// 			this.start_animate();
// 		} else {
// 			this.camera = null;
// 		}

// 		this.set_texture(this.texture);
// 	}

// 	private start_animate() {
// 		if (this.animated_started == false) {
// 			this.animate();
// 			this.animated_started = true;
// 		}
// 	}

// 	private animate() {
// 		if (this.do_render) {
// 			this.request_animation_frame_id = requestAnimationFrame(
// 				this.animate_method
// 			);

// 			const now = Date.now();
// 			const elapsed_time = now - this.previous_render_timestamp;
// 			if (
// 				this.previous_render_timestamp == null ||
// 				elapsed_time > this.fps_interval
// 			) {
// 				this.render();

// 				this.previous_render_timestamp = Date.now();
// 			}
// 		}
// 	}

// 	// TODO: add a before_destroy for nodes
// 	private cancel_animate() {
// 		this.do_render = false;
// 		this.animated_started = false;
// 		cancelAnimationFrame(this.request_animation_frame_id);
// 		this.renderer.dispose();
// 	}

// 	private render() {
// 		this.renderer.clear();
// 		if (this.camera) {
// 			this._camera_node.setup_for_aspect_ratio(this._aspect);
// 			this.renderer.render(this._display_scene, this.camera);
// 			this.update_texture_from_renderer();
// 		}

// 		// vector.x = ( window.innerWidth * dpr / 2 ) - ( textureSize / 2 );
// 		// vector.y = ( window.innerHeight * dpr / 2 ) - ( textureSize / 2 )
// 		// const vector = new THREE.Vector2(0, 0);
// 		// const vector = new THREE.Vector2(resolution.x, resolution.y);
// 		// const vector = new THREE.Vector2(
// 		// 	( resolution.x * this.dpr / 2 ) - ( resolution.x * this.dpr / 2 ),
// 		// 	( resolution.y * this.dpr / 2 ) - ( resolution.y * this.dpr / 2 )
// 		// );
// 		// console.log(vector)
// 		// this.renderer.copyFramebufferToTexture( vector, this.texture );

// 		// console.log(this.texture.image.data, lodash_uniq(this.texture.image.data))
// 	}

// 	private create_renderer() {
// 		const renderer = new THREE.WebGLRenderer({ antialias: true });
// 		renderer.setPixelRatio(window.devicePixelRatio);
// 		// document.body.appendChild( renderer.domElement )
// 		renderer.autoClear = false;

// 		return renderer;
// 	}

// 	// private create_texture(resolution: THREE.Vector2){

// 	// 	const data = new Uint8Array( (resolution.x*this.dpr) * (resolution.y*this.dpr) * 3 )

// 	// 	const texture = new THREE.DataTexture( data, resolution.x, resolution.y, THREE.RGBFormat );
// 	// 	texture.minFilter = THREE.NearestFilter;
// 	// 	texture.magFilter = THREE.NearestFilter;
// 	// 	texture.needsUpdate = true

// 	// 	return texture
// 	// }
// 	private update_texture_from_renderer() {
// 		const data_url = this.renderer.domElement.toDataURL();
// 		const image = new Image();
// 		this.texture.image = image;
// 		image.onload = () => {
// 			this.texture.needsUpdate = true;
// 		};
// 		image.src = data_url;
// 	}
// }
