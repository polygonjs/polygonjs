import {BaseCameraControlsEventNodeType, CameraControls} from '../_BaseCameraControls';

export class CameraControlsConfig {
	constructor(
		private _camera_node_id: string,
		private _controls_node: BaseCameraControlsEventNodeType,
		private _controls: CameraControls
	) {}

	get camera_node_id() {
		return this._camera_node_id;
	}
	// camera_controls_node_id(){
	// 	return this._camera_controls_node_id
	// }
	get controls() {
		return this._controls;
	}
	get controls_node() {
		return this._controls_node;
	}

	is_equal(other_config: CameraControlsConfig): boolean {
		return (
			other_config.camera_node_id == this._camera_node_id &&
			other_config.controls_node.graph_node_id == this._controls_node.graph_node_id
		);
	}
}
