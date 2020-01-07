import {PolyScene} from '../PolyScene'

export function Camera<TBase extends Constructor>(Base: TBase) {
	return class extends Base {
		protected self: PolyScene = (<unknown>this) as PolyScene
		_master_camera_node_path: string

		set_master_camera_node_path(camera_node_path: string) {
			this._master_camera_node_path = camera_node_path
		}
		master_camera_node_path() {
			return this._master_camera_node_path
		}
		master_camera_node() {
			const camera_node = this.self.node(this.master_camera_node_path())
			if (camera_node) {
				return camera_node
			} else {
				console.warn('master camera node not found')
				return this._find_any_camera()
			}
		}

		private _find_any_camera() {
			const root = this.self.root()
			return root.nodes_by_type('perspective_camera')[0] || root.nodes_by_type('orthographic_camera')[0]
		}
	}
}
