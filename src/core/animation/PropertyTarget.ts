import {Object3D} from 'three';
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
		return new AnimPropertyTarget(this._scene, this._options);
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
