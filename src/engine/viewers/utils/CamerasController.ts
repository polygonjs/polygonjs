// import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {BaseViewerType} from '../_Base';

export class ViewerCamerasController {
	// private _is_active: boolean = false;
	// private _camera_node: BaseThreejsCameraObjNodeType | undefined;
	// private _camera: Camera;

	private _size: Vector2 = new Vector2(100, 100);
	private _aspect: number = 1;

	constructor(private _viewer: BaseViewerType) {}

	get camera_node() {
		return this._viewer.camera_node;
	}
	get size() {
		return this._size;
	}
	get aspect() {
		return this._aspect;
	}

	compute_size_and_aspect() {
		this._update_size();
		this.camera_node.scene.uniforms_controller.update_resolution_dependent_uniform_owners(this._size);
		this._aspect = this._get_aspect();
	}

	private _update_size() {
		this._size.x = this._viewer.container.offsetWidth;
		this._size.y = this._viewer.container.offsetHeight;
	}
	private _get_aspect(): number {
		return this._size.x / this._size.y;
	}

	update_camera_aspect() {
		this.camera_node.setup_for_aspect_ratio(this._aspect);
	}

	async prepare_current_camera() {
		await this.camera_node.requestContainer(); // ensure the camera is cooked
		await this._update_from_camera_container(); //container, graph_node_id)
	}

	async _update_from_camera_container() {
		this.update_camera_aspect();

		await this._viewer.controls_controller?.create_controls();
	}
}
