import {Object3D} from 'three';
import {PolyScene} from '../../../../scene/PolyScene';
import {BaseJsNodeType} from '../../_Base';
import {ShadersCollectionController} from '../utils/ShadersCollectionController';
import {EvaluatorConstant} from './actor/Evaluator';

export abstract class BaseNamedFunction {
	abstract type: string;
	public readonly scene: PolyScene;
	constructor(protected node: BaseJsNodeType, protected shadersCollectionController: ShadersCollectionController) {
		this.scene = node.scene();
	}
	abstract func(...args: any): any;
	asString(...args: any): string {
		this.shadersCollectionController.addFunction(this.node, this);
		return '';
	}
}
export abstract class NamedFunction<ARGS extends Array<any>, ARGS_STR extends Array<string>> extends BaseNamedFunction {
	abstract override func(...args: ARGS): any;
	override asString(...args: ARGS_STR): string {
		super.asString(...args);
		return `${this.type}(${args.join(', ')})`;
	}
}
abstract class ObjectNamedFunction<ARGS extends Array<any>, ARGS_STR extends Array<string>> extends BaseNamedFunction {
	abstract override func(object: Object3D, ...args: ARGS): any;
	override asString(...args: ARGS_STR): string {
		super.asString(...args);
		return `${this.type}(${EvaluatorConstant.OBJECT_3D}, ${args.join(', ')})`;
	}
}
abstract class SceneNamedFunction<ARGS extends Array<any>, ARGS_STR extends Array<string>> extends BaseNamedFunction {
	abstract override func(object: PolyScene, ...args: ARGS): any;
	override asString(...args: ARGS_STR): string {
		super.asString(...args);
		return `${this.type}(${EvaluatorConstant.SCENE}, ${args.join(', ')})`;
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
export abstract class ObjectNamedFunction3<ARGS extends [any, any, any]> extends ObjectNamedFunction<
	ARGS,
	[string, string, string]
> {}
export abstract class ObjectNamedFunction4<ARGS extends [any, any, any, any]> extends ObjectNamedFunction<
	ARGS,
	[string, string, string, string]
> {}
export abstract class ObjectNamedFunction5<ARGS extends [any, any, any, any, any]> extends ObjectNamedFunction<
	ARGS,
	[string, string, string, string, string]
> {}
export abstract class SceneNamedFunction0 extends SceneNamedFunction<[], []> {}
