import {Scene} from 'three/src/scenes/Scene';
import {Group} from 'three/src/objects/Group';
import {Object3D} from 'three/src/core/Object3D';
import {CubeCamera} from 'three/src/cameras/CubeCamera';
import {sRGBEncoding} from 'three/src/constants';
import {PMREMGenerator} from 'three/src/extras/PMREMGenerator';
import {WebGLRenderTargetCube} from 'three/src/renderers/WebGLRenderTargetCube';

import {CoreTransform} from 'src/core/Transform';

import {BaseObjNode} from './_Base';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
// import {Transformed} from './Concerns/Transformed';

const LIGHT_TYPES = ['HemisphereLight', 'SpotLight', 'PointLight'];

export class CubeCameraObjNode extends BaseObjNode {
	static type() {
		return 'cube_camera';
	}

	private _param_near: number;
	private _param_far: number;
	private _param_resolution: number;
	private _param_object_mask: string;

	private _cube_camera_scene: Scene;
	private _cube_camera_objects: Object3D[];
	private _cube_camera: CubeCamera;

	constructor() {
		super();

		// this._init_display_flag({
		// 	has_display_flag: false,
		// });

		this._init_dirtyable_hook();

		this.io.inputs.set_count_to_one_max();
	}

	create_object() {
		return new Group();
	}

	//base_layers_included: -> false

	create_params() {
		CoreTransform.create_params(this);
		this.within_param_folder('cube_camera', () => {
			this.add_param(ParamType.FLOAT, 'near', 0.1, {range: [0, 1], range_locked: [true, false]});
			this.add_param(ParamType.FLOAT, 'far', 10, {range: [0, 100], range_locked: [true, false]});

			this.add_param(ParamType.INTEGER, 'resolution', 256);
			this.add_param(ParamType.STRING, 'object_mask', '*light* *'); // ensure lights are in it too

			this.add_param(ParamType.BUTTON, 'render', null, {
				callback: this.render.bind(this),
			});
		});
	}

	cook() {
		const matrix = CoreTransform.matrix_from_node_with_transform_params(this);

		// const group = this.group();
		this.transform_controller.update(matrix);

		this._cube_camera_scene = this._cube_camera_scene || new Scene();
		this._cube_camera_objects = this.scene().objects_from_mask(this._param_object_mask);

		// re-create the cube_camera
		let camera_recreate_required = false;
		if (this._cube_camera) {
			const first_camera = this._cube_camera.children[0] as PerspectiveCamera;
			const current_near = first_camera.near;
			const current_far = first_camera.far;
			const current_resolution = this._cube_camera.renderTarget.width;
			if (
				current_near != this._param_near ||
				current_far != this._param_far ||
				current_resolution != this._param_resolution
			) {
				console.log(current_near, this._param_near);
				console.log(current_far, this._param_far);
				console.log(current_resolution, this._param_resolution, this._cube_camera.renderTarget);
				camera_recreate_required = true;
			}

			if (camera_recreate_required) {
				this.object.remove(this._cube_camera);
			}
		}
		if (!this._cube_camera || camera_recreate_required) {
			this._cube_camera = new CubeCamera(this._param_near, this._param_far, this._param_resolution, {
				encoding: sRGBEncoding,
			} as any); // TODO: typescript, check conversion
			this.object.add(this._cube_camera);
			// update nodes
			for (let node of this.dependencies_controller.param_nodes_referree()) {
				node.set_dirty();
			}
		}

		this.cook_controller.end_cook();
	}

	render_target() {
		if (this._cube_camera) {
			return this._cube_camera.renderTarget;
		}
	}

	render() {
		const renderer = POLY.renderers_controller.first_renderer();
		if (renderer) {
			// add objects to this._cube_camera_scene
			const parent_by_child_uuid: Dictionary<Object3D> = {};
			let light_given = false;
			for (let object of this._cube_camera_objects) {
				if (!light_given && this.object_is_light(object)) {
					light_given = true;
				}
				parent_by_child_uuid[object.uuid] = object.parent;
				this._cube_camera_scene.add(object);
			}
			if (!light_given) {
				console.warn('no light is present in the objects rendered by the cubemap');
			}

			// Currently still using the cube_camera, which cannot be blurred.
			// The pmremGenerator.fromScene allows to have an env map that can be blurred
			// But the COP node, and then the material node are not yet updated accordingly
			const dependencies_solved = false;
			if (dependencies_solved) {
				var pmremGenerator = new PMREMGenerator(renderer);
				// 0.04 from the threejs examples
				const render_target = pmremGenerator.fromScene(this._cube_camera_scene, 0.04);
				pmremGenerator.dispose();
				this._cube_camera.renderTarget = render_target as WebGLRenderTargetCube; // TODO: typescript, check conversion
				console.log('render_target1', render_target);
			} else {
				this._cube_camera.update(renderer, this._cube_camera_scene);
			}

			// re-add objects back to their original parent
			for (let object of this._cube_camera_objects) {
				parent_by_child_uuid[object.uuid].add(object);
			}
		} else {
			console.warn(`no renderer found for ${this.full_path()}`);
		}
	}

	private object_is_light(object: Object3D): boolean {
		return LIGHT_TYPES.includes(object.type);
	}
}
