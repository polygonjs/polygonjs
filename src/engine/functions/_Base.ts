import {Object3D} from 'three';
import {PolyScene} from '../scene/PolyScene';
import {BaseNodeType} from '../nodes/_Base';
import {BaseJsNodeType} from '../nodes/js/_Base';
import {JsLinesCollectionController} from '../nodes/js/code/utils/JsLinesCollectionController';
import {EvaluatorConstant} from '../nodes/js/code/assemblers/actor/Evaluator';
import {NodeContext} from '../poly/NodeContext';
import {AssemblerControllerNode} from '../nodes/js/code/Controller';
import {TimeController} from '../scene/utils/TimeController';
import {BaseJsShaderAssembler} from '../nodes/js/code/assemblers/_Base';

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
	protected timeController: TimeController;
	constructor(node: BaseNodeType, public readonly shadersCollectionController?: JsLinesCollectionController) {
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

export abstract class NamedFunction1<ARGS extends [any]> extends NamedFunction<ARGS, [string]> {}
export abstract class NamedFunction2<ARGS extends [any, any]> extends NamedFunction<ARGS, [string, string]> {}
export abstract class NamedFunction3<ARGS extends [any, any, any]> extends NamedFunction<
	ARGS,
	[string, string, string]
> {}
export abstract class NamedFunction4<ARGS extends [any, any, any, any]> extends NamedFunction<
	ARGS,
	[string, string, string, string]
> {}
export abstract class NamedFunction5<ARGS extends [any, any, any, any, any]> extends NamedFunction<
	ARGS,
	[string, string, string, string, string]
> {}
export abstract class NamedFunction6<ARGS extends [any, any, any, any, any, any]> extends NamedFunction<
	ARGS,
	[string, string, string, string, string, string]
> {}
export abstract class NamedFunction7<ARGS extends [any, any, any, any, any, any, any]> extends NamedFunction<
	ARGS,
	[string, string, string, string, string, string, string]
> {}
export abstract class NamedFunction8<ARGS extends [any, any, any, any, any, any, any, any]> extends NamedFunction<
	ARGS,
	[string, string, string, string, string, string, string, string]
> {}
export abstract class NamedFunction9<ARGS extends [any, any, any, any, any, any, any, any, any]> extends NamedFunction<
	ARGS,
	[string, string, string, string, string, string, string, string, string]
> {}

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
export abstract class ObjectNamedFunction0 extends ObjectNamedFunction<[], [string]> {}
export abstract class ObjectNamedFunction1<ARGS extends [any]> extends ObjectNamedFunction<ARGS, [string, string]> {}
export abstract class ObjectNamedFunction2<ARGS extends [any, any]> extends ObjectNamedFunction<
	ARGS,
	[string, string, string]
> {}
export abstract class ObjectNamedFunction3<ARGS extends [any, any, any]> extends ObjectNamedFunction<
	ARGS,
	[string, string, string, string]
> {}
export abstract class ObjectNamedFunction4<ARGS extends [any, any, any, any]> extends ObjectNamedFunction<
	ARGS,
	[string, string, string, string, string]
> {}
export abstract class ObjectNamedFunction5<ARGS extends [any, any, any, any, any]> extends ObjectNamedFunction<
	ARGS,
	[string, string, string, string, string, string]
> {}
export abstract class ObjectNamedFunction6<ARGS extends [any, any, any, any, any, any]> extends ObjectNamedFunction<
	ARGS,
	[string, string, string, string, string, string, string]
> {}
export abstract class ObjectNamedFunction7<
	ARGS extends [any, any, any, any, any, any, any]
> extends ObjectNamedFunction<ARGS, [string, string, string, string, string, string, string, string]> {}
export abstract class ObjectNamedFunction8<
	ARGS extends [any, any, any, any, any, any, any, any]
> extends ObjectNamedFunction<ARGS, [string, string, string, string, string, string, string, string, string]> {}

//
//
// SCENE
//
//
abstract class SceneNamedFunction<ARGS extends Array<any>, ARGS_STR extends Array<string>> extends BaseNamedFunction {
	abstract override func(object: PolyScene, ...args: ARGS): any;
	override asString(...args: ARGS_STR): string {
		super.asString(...args);
		return `${this.type()}(${EvaluatorConstant.SCENE}, ${args.join(', ')})`;
	}
}
export abstract class SceneNamedFunction0 extends SceneNamedFunction<[], []> {}
