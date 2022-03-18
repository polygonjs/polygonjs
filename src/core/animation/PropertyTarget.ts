import {Object3D} from 'three/src/core/Object3D';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {PolyScene} from '../../engine/scene/PolyScene';

interface PropertyTargetOptions {
	node?: {
		path: string;
		relativeTo: BaseNodeType;
	};
	object?: {
		list?: Object3D[];
		mask?: string;
	};
}
export class AnimPropertyTarget {
	constructor(private _scene: PolyScene, private _options: PropertyTargetOptions) {}

	clone() {
		const property_target = new AnimPropertyTarget(this._scene, this._options);
		return property_target;
	}

	objects() {
		const objectData = this._options.object;
		if (!objectData) {
			return;
		}
		if (objectData.list) {
			return objectData.list;
		}
		const mask = objectData.mask;
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
