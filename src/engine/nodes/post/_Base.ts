import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {TypedNode, BaseNodeType} from '../_Base';
import {EffectComposer} from '../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
import {NodeContext} from '../../poly/NodeContext';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {Scene} from 'three/src/scenes/Scene';
import {FlagsControllerDB} from '../utils/FlagsController';
import {Pass} from '../../../modules/three/examples/jsm/postprocessing/Pass';
import {BaseParamType} from '../../params/_Base';
import {ParamOptions} from '../../params/utils/OptionsController';
import {CoreGraphNodeId} from '../../../core/graph/CoreGraph';

const INPUT_PASS_NAME = 'input pass';
const DEFAULT_INPUT_NAMES = [INPUT_PASS_NAME];
export interface TypedPostNodeContext {
	composer: EffectComposer;
	camera: Camera;
	resolution: Vector2;
	scene: Scene;
	requester: BaseNodeType;
	camera_node?: BaseCameraObjNodeType;
}

function PostParamCallback(node: BaseNodeType, param: BaseParamType) {
	TypedPostProcessNode.PARAM_CALLBACK_update_passes(node as BasePostProcessNodeType);
}
export const PostParamOptions: ParamOptions = {
	cook: false,
	callback: PostParamCallback,
	computeOnDirty: true, // important if an expression drives a param
};

export class TypedPostProcessNode<P extends Pass, K extends NodeParamsConfig> extends TypedNode<NodeContext.POST, K> {
	static node_context(): NodeContext {
		return NodeContext.POST;
	}

	public readonly flags: FlagsControllerDB = new FlagsControllerDB(this);

	protected _passes_by_requester_id: Map<CoreGraphNodeId, P> = new Map();

	static displayed_input_names(): string[] {
		return DEFAULT_INPUT_NAMES;
	}
	initialize_node() {
		this.flags.display.set(false);
		this.flags.display.add_hook(() => {
			if (this.flags.display.active()) {
				const parent = this.parent;
				if (parent && parent.display_node_controller) {
					parent.display_node_controller.set_display_node(this);
				}
			}
		});

		this.io.inputs.set_count(0, 1);
		this.io.outputs.set_has_one_output();
	}

	set_render_pass(render_pass: any) {
		this.set_container(render_pass);
	}
	cook() {
		this.cook_controller.end_cook();
	}
	setup_composer(context: TypedPostNodeContext): void {
		this._add_pass_from_input(0, context);

		if (!this.flags.bypass.active()) {
			let pass = this._passes_by_requester_id.get(context.requester.graphNodeId());
			if (!pass) {
				pass = this._create_pass(context);
				if (pass) {
					this._passes_by_requester_id.set(context.requester.graphNodeId(), pass);
				}
			}
			if (pass) {
				context.composer.addPass(pass);
			}
		}
	}
	protected _add_pass_from_input(index: number, context: TypedPostNodeContext) {
		const input = this.io.inputs.input(index);
		if (input) {
			input.setup_composer(context);
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
		this._passes_by_requester_id.forEach(this._update_pass_bound);
	}
	protected update_pass(pass: P) {}
}

export type BasePostProcessNodeType = TypedPostProcessNode<Pass, NodeParamsConfig>;
export class BasePostProcessNodeClass extends TypedPostProcessNode<Pass, NodeParamsConfig> {}
