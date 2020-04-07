import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {TypedNode, BaseNodeType} from '../_Base';

import {PostProcessContainer} from '../../containers/PostProcess';
import {EffectComposer} from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
import {NodeContext} from '../../poly/NodeContext';
// import {PolyScene} from '../../scene/PolyScene';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Scene} from 'three/src/scenes/Scene';
import {FlagsControllerB} from '../utils/FlagsController';
import {Pass} from '../../../../modules/three/examples/jsm/postprocessing/Pass';
import {BaseParamType} from '../../params/_Base';

export interface TypedPostNodeContext {
	composer: EffectComposer;
	camera: Camera;
	resolution: Vector2;
	camera_node: BaseCameraObjNodeType;
	scene: Scene;
	canvas: HTMLCanvasElement;
}

export function PostParamCallback(node: BaseNodeType, param: BaseParamType) {
	TypedPostProcessNode.PARAM_CALLBACK_update_passes(node as BasePostProcessNodeType);
}

export class TypedPostProcessNode<P extends Pass, K extends NodeParamsConfig> extends TypedNode<
	'POST',
	BasePostProcessNodeType,
	K
> {
	container_controller: TypedContainerController<PostProcessContainer> = new TypedContainerController<
		PostProcessContainer
	>(this, PostProcessContainer);

	public readonly flags: FlagsControllerB = new FlagsControllerB(this);
	static node_context(): NodeContext {
		return NodeContext.POST;
	}

	protected _passes_by_canvas_id: Map<string, P> = new Map();

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.outputs.set_has_one_output();
	}
	node_sibbling(name: string): BasePostProcessNodeType | null {
		return super.node_sibbling(name) as BasePostProcessNodeType | null;
	}

	set_render_pass(render_pass: any) {
		this.set_container(render_pass);
	}
	cook() {
		this.cook_controller.end_cook();
	}
	setup_composer(context: TypedPostNodeContext): void {
		const input = this.io.inputs.input(0);
		if (input) {
			input.setup_composer(context);
		}
		if (!this.flags.bypass.active) {
			let pass = this._passes_by_canvas_id.get(context.canvas.id);
			if (!pass) {
				pass = this._create_pass(context);
				if (pass) {
					this._passes_by_canvas_id.set(context.canvas.id, pass);
				}
			}
			if (pass) {
				console.log('adding pass', this.full_path());
				context.composer.addPass(pass);
			}
		}
	}
	protected _create_pass(context: TypedPostNodeContext): P | undefined {
		return undefined;
	}

	static PARAM_CALLBACK_update_passes(node: BasePostProcessNodeType) {
		node.update_passes();
	}
	private _update_pass_bound = this.update_pass.bind(this);
	private update_passes() {
		this._passes_by_canvas_id.forEach(this._update_pass_bound);
	}
	protected update_pass(pass: P) {}
}

export type BasePostProcessNodeType = TypedPostProcessNode<Pass, NodeParamsConfig>;
export class BasePostProcessNodeClass extends TypedPostProcessNode<Pass, NodeParamsConfig> {}
