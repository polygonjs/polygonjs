/**
 * A subnet to create actor nodes
 *
 */

import {ParamLessBaseNetworkPostNode} from './_BaseManager';
import {NodeContext, NetworkNodeType} from '../../poly/NodeContext';
import {JsNodeChildrenMap} from '../../poly/registers/nodes/Js';
import {BaseJsNodeType} from '../js/_Base';
import {Constructor, valueof} from '../../../types/GlobalTypes';
import {NodeCreateOptions} from '../utils/hierarchy/ChildrenController';
import {ActorPersistedConfig} from '../js/code/assemblers/actor/ActorPersistedConfig';
import {AssemblerName} from '../../poly/registers/assemblers/_BaseRegister';
import {JsAssemblerController} from '../js/code/Controller';
import {JsAssemblerActor} from '../js/code/assemblers/actor/ActorAssembler';
import {ActorCompilationController} from '../../../core/actor/ActorCompilationController';
import {Poly} from '../../Poly';

export class ActorsNetworkPostNode extends ParamLessBaseNetworkPostNode {
	static override type() {
		return NetworkNodeType.ACTOR;
	}

	protected override _childrenControllerContext = NodeContext.JS;

	override createNode<S extends keyof JsNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): JsNodeChildrenMap[S];
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<JsNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}
	override children() {
		return super.children() as BaseJsNodeType[];
	}
	override nodesByType<K extends keyof JsNodeChildrenMap>(type: K): JsNodeChildrenMap[K][] {
		return super.nodesByType(type) as JsNodeChildrenMap[K][];
	}

	//
	override childrenAllowed() {
		if (this.assemblerController()) {
			return super.childrenAllowed();
		}
		return false;
	}
	override sceneReadonly() {
		return this.assemblerController() == null;
	}

	//
	// ASSEMBLERS
	//
	override readonly persisted_config: ActorPersistedConfig = new ActorPersistedConfig(this);
	assemblerController() {
		return this._assemblerController;
	}
	public override usedAssembler(): Readonly<AssemblerName.JS_ACTOR> {
		return AssemblerName.JS_ACTOR;
	}
	protected _assemblerController = this._createAssemblerController();
	private _createAssemblerController(): JsAssemblerController<JsAssemblerActor> | undefined {
		return Poly.assemblersRegister.assembler(this, this.usedAssembler());
	}

	//
	// compilation
	//
	public readonly compilationController: ActorCompilationController = new ActorCompilationController(this);
	compile() {
		this.compilationController.compile();
	}
	override async cook() {
		await this.compilationController.compileIfRequired();
		this.cookController.endCook();
	}
}
