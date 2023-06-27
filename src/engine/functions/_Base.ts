import {Object3D} from 'three';
import {PolyScene} from '../scene/PolyScene';
import {BaseNodeType} from '../nodes/_Base';
import {BaseJsNodeType} from '../nodes/js/_Base';
import {JsLinesCollectionController} from '../nodes/js/code/utils/JsLinesCollectionController';
import {NodeContext} from '../poly/NodeContext';
import {AssemblerControllerNode} from '../nodes/js/code/Controller';
import {TimeController} from '../scene/utils/TimeController';
import {BaseJsShaderAssembler} from '../nodes/js/code/assemblers/_Base';
import {
	Tuple1,
	Tuple2,
	Tuple3,
	Tuple4,
	Tuple5,
	Tuple6,
	Tuple7,
	Tuple8,
	Tuple9,
	Tuple10,
	Tuple11,
	Tuple12,
	Tuple13,
	Tuple14,
	Tuple15,
	Tuple16,
	Tuple17,
	Tuple18,
	Tuple19,
	Tuple20,
	Tuple21,
	Tuple22,
} from '../../types/GlobalTypes';

export abstract class BaseNamedFunction {
	// abstract type: string;
	static type(): string {
		throw 'type to be overriden';
	}
	type() {
		const c = this.constructor as typeof BaseNamedFunction;
		return c.type();
	}
	public readonly scene: PolyScene;
	public readonly jsNode?: BaseJsNodeType;
	public readonly functionNode: AssemblerControllerNode<BaseJsShaderAssembler>;
	public readonly timeController: TimeController;
	constructor(
		public readonly node: BaseNodeType,
		public readonly shadersCollectionController?: JsLinesCollectionController
	) {
		this.scene = node.scene();
		this.timeController = this.scene.timeController;
		if (node.context() == NodeContext.JS) {
			this.jsNode = node as BaseJsNodeType;
			this.functionNode = this.jsNode.functionNode()!;
		} else {
			this.jsNode = undefined;
			this.functionNode = node as AssemblerControllerNode<BaseJsShaderAssembler>;
		}
	}
	abstract func(...args: any): any;
	asString(...args: any): string {
		if (this.shadersCollectionController) {
			if (this.jsNode) {
				this.shadersCollectionController.addFunction(this.jsNode, this);
			}
		} else {
			console.warn('no shadersCollectionController in func', this.type());
		}
		return '';
	}
}
export abstract class NamedFunction<ARGS extends Array<any>, ARGS_STR extends Array<string>> extends BaseNamedFunction {
	abstract override func(...args: ARGS): any;
	override asString(...args: ARGS_STR): string {
		super.asString(...args);
		return `${this.type()}(${args.join(', ')})`;
	}
}

export abstract class NamedFunction0 extends NamedFunction<[], []> {}

export abstract class NamedFunction1<ARGS extends Tuple1<any>> extends NamedFunction<ARGS, Tuple1<any>> {}
export abstract class NamedFunction2<ARGS extends Tuple2<any>> extends NamedFunction<ARGS, Tuple2<string>> {}
export abstract class NamedFunction3<ARGS extends Tuple3<any>> extends NamedFunction<ARGS, Tuple3<string>> {}
export abstract class NamedFunction4<ARGS extends Tuple4<any>> extends NamedFunction<ARGS, Tuple4<string>> {}
export abstract class NamedFunction5<ARGS extends Tuple5<any>> extends NamedFunction<ARGS, Tuple5<string>> {}
export abstract class NamedFunction6<ARGS extends Tuple6<any>> extends NamedFunction<ARGS, Tuple6<string>> {}
export abstract class NamedFunction7<ARGS extends Tuple7<any>> extends NamedFunction<ARGS, Tuple7<string>> {}
export abstract class NamedFunction8<ARGS extends Tuple8<any>> extends NamedFunction<ARGS, Tuple8<string>> {}
export abstract class NamedFunction9<ARGS extends Tuple9<any>> extends NamedFunction<ARGS, Tuple9<string>> {}
//
//
// OBJECT
//
//
abstract class ObjectNamedFunction<ARGS extends Array<any>, ARGS_STR extends Array<string>> extends BaseNamedFunction {
	abstract override func(object: Object3D, ...args: ARGS): any;
	override asString(...args: ARGS_STR): string {
		super.asString(...args);
		return `${this.type()}(${args.join(', ')})`;
	}
}
export abstract class ObjectNamedFunction0 extends ObjectNamedFunction<[], Tuple1<string>> {}
export abstract class ObjectNamedFunction1<ARGS extends Tuple1<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple2<string>
> {}
export abstract class ObjectNamedFunction2<ARGS extends Tuple2<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple3<string>
> {}
export abstract class ObjectNamedFunction3<ARGS extends Tuple3<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple4<string>
> {}
export abstract class ObjectNamedFunction4<ARGS extends Tuple4<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple5<string>
> {}
export abstract class ObjectNamedFunction5<ARGS extends Tuple5<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple6<string>
> {}
export abstract class ObjectNamedFunction6<ARGS extends Tuple6<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple7<string>
> {}
export abstract class ObjectNamedFunction7<ARGS extends Tuple7<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple8<string>
> {}
export abstract class ObjectNamedFunction8<ARGS extends Tuple8<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple9<string>
> {}
export abstract class ObjectNamedFunction9<ARGS extends Tuple9<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple10<string>
> {}
export abstract class ObjectNamedFunction10<ARGS extends Tuple10<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple11<string>
> {}
export abstract class ObjectNamedFunction11<ARGS extends Tuple11<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple12<string>
> {}
export abstract class ObjectNamedFunction12<ARGS extends Tuple12<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple13<string>
> {}
export abstract class ObjectNamedFunction13<ARGS extends Tuple13<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple14<string>
> {}
export abstract class ObjectNamedFunction14<ARGS extends Tuple14<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple15<string>
> {}
export abstract class ObjectNamedFunction15<ARGS extends Tuple15<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple16<string>
> {}
export abstract class ObjectNamedFunction16<ARGS extends Tuple16<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple17<string>
> {}
export abstract class ObjectNamedFunction17<ARGS extends Tuple17<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple18<string>
> {}
export abstract class ObjectNamedFunction18<ARGS extends Tuple18<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple19<string>
> {}
export abstract class ObjectNamedFunction19<ARGS extends Tuple19<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple20<string>
> {}
export abstract class ObjectNamedFunction20<ARGS extends Tuple20<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple21<string>
> {}
export abstract class ObjectNamedFunction21<ARGS extends Tuple21<any>> extends ObjectNamedFunction<
	ARGS,
	Tuple22<string>
> {}

//
//
// SCENE
//
//
// abstract class SceneNamedFunction<ARGS extends Array<any>, ARGS_STR extends Array<string>> extends BaseNamedFunction {
// 	abstract override func(object: PolyScene, ...args: ARGS): any;
// 	override asString(...args: ARGS_STR): string {
// 		super.asString(...args);
// 		return `${this.type()}(${EvaluatorConstant.SCENE}, ${args.join(', ')})`;
// 	}
// }
// export abstract class SceneNamedFunction0 extends SceneNamedFunction<[], []> {}
