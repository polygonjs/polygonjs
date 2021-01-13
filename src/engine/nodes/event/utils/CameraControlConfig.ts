import {BaseCameraControlsEventNodeType, CameraControls} from '../_BaseCameraControls';
import {CoreGraphNodeId} from '../../../../core/graph/CoreGraph';

export class CameraControlsConfig {
	private _update_required: boolean;
	constructor(
		private _camera_node_id: CoreGraphNodeId,
		private _controls_node: BaseCameraControlsEventNodeType,
		private _controls: CameraControls
	) {
		this._update_required = this._controls_node.update_required();
	}
	update_required() {
		return this._update_required;
	}

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
			other_config.controls_node.graphNodeId() == this._controls_node.graphNodeId()
		);
	}
}
