import {ObjectNamedFunction2} from './_Base';
import {_matchArrayLength} from './_ArrayUtils';
import {Object3D} from 'three';
import {ActorEvaluatorDebugOptions} from '../scene/utils/DispatchController';
import {JsDataType} from '../nodes/utils/io/connections/Js';

//
//
//  Array Props
//
//
const options: ActorEvaluatorDebugOptions = {
	object3D: new Object3D(),
	nodePath: '',
	value: 0,
};
export class debug<T extends JsDataType> extends ObjectNamedFunction2<[string, T]> {
	static override type() {
		return 'debug';
	}
	override func(object3D: Object3D, nodePath: string, input: T): T {
		if (this.scene.dispatchController.emitAllowed()) {
			options.object3D = object3D;
			options.nodePath = nodePath;
			options.value = input;
			this.scene.dispatchController.actorEvaluatorDebug(options);
		}
		return input;
	}
}
