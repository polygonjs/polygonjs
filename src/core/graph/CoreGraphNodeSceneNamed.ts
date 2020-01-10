import {CoreGraphNodeScene} from './CoreGraphNodeScene';

export class CoreGraphNodeSceneNamed extends CoreGraphNodeScene {
	protected _name: string;
	get name() {
		return this._name;
	}
	set_name(name: string) {
		this._name = name;
	}
}
