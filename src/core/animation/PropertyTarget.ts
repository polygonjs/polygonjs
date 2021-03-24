import {BaseNodeType} from '../../engine/nodes/_Base';
import {PolyScene} from '../../engine/scene/PolyScene';

interface PropertyTargetOptions {
	node?: {
		path: string;
		relativeTo: BaseNodeType;
	};
	objectMask?: string;
}
export class PropertyTarget {
	constructor(private _scene: PolyScene, private _options: PropertyTargetOptions) {}

	clone() {
		const property_target = new PropertyTarget(this._scene, this._options);
		return property_target;
	}

	objects() {
		const mask = this._options.objectMask;
		if (!mask) {
			return;
		}
		return this._scene.objectsByMask(mask);
	}

	node() {
		if (!this._options.node) {
			return;
		}
		const options = this._options.node;
		return options.relativeTo.node(options.path);
	}
}
