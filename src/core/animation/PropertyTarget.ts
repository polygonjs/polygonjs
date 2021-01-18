import {PolyScene} from '../../engine/scene/PolyScene';

export class PropertyTarget {
	private _node_path: string | undefined;
	private _object_mask: string | undefined;

	clone() {
		const property_target = new PropertyTarget();
		if (this._node_path) {
			property_target.set_node_path(this._node_path);
		}
		if (this._object_mask) {
			property_target.set_object_mask(this._object_mask);
		}
		return property_target;
	}

	set_node_path(node_path: string) {
		this._node_path = node_path;
	}
	set_object_mask(object_mask: string) {
		this._object_mask = object_mask;
	}
	objects(scene: PolyScene) {
		const mask = this._object_mask;
		if (!mask) {
			return;
		}
		return scene.objectsByMask(mask);
	}
	node(scene: PolyScene) {
		if (!this._node_path) {
			return;
		}
		return scene.node(this._node_path);
	}
}
