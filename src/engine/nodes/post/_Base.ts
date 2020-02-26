import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {TypedNode} from '../_Base';

import {PostProcessContainer} from '../../containers/PostProcess';
import {EffectComposer} from '../../../../modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCameraObjNodeType} from '../obj/_BaseCamera';
import {NodeContext} from '../../poly/NodeContext';
// import {PolyScene} from '../../scene/PolyScene';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';

export class TypedPostProcessNode<K extends NodeParamsConfig> extends TypedNode<'POST', BasePostProcessNodeType, K> {
	container_controller: TypedContainerController<PostProcessContainer> = new TypedContainerController<
		PostProcessContainer
	>(this, PostProcessContainer);

	static node_context(): NodeContext {
		return NodeContext.POST;
	}

	initialize_node() {
		// this.io.inputs.set_count_to_zero();
		// this._init_outputs({has_outputs: false});
	}

	set_render_pass(render_pass: any) {
		this.set_container(render_pass);
	}

	apply_to_composer(
		composer: EffectComposer,
		camera: Camera,
		resolution: Vector2,
		camera_node: BaseCameraObjNodeType
	): void {}
}

export type BasePostProcessNodeType = TypedPostProcessNode<NodeParamsConfig>;
export class BasePostProcessNodeClass extends TypedPostProcessNode<NodeParamsConfig> {}
