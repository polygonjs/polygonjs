import {Camera} from 'three/src/cameras/Camera';
import {Vector2} from 'three/src/math/Vector2';
import {BaseNode} from '../_Base';

import {PostProcessContainer} from 'src/engine/containers/PostProcess';
import {EffectComposer} from 'modules/three/examples/jsm/postprocessing/EffectComposer';
import {BaseCamera} from '../obj/_BaseCamera';

export abstract class BasePostProcessNode extends BaseNode {
	static node_context(): NodeContext {
		return NodeContext.POST;
	}

	constructor() {
		super();
		this.container_controller.init(PostProcessContainer);

		// this.io.inputs.set_count_to_zero();
		// this._init_outputs({has_outputs: false});
	}

	set_render_pass(render_pass: any) {
		this.set_container(render_pass);
	}

	abstract apply_to_composer(
		composer: EffectComposer,
		camera: Camera,
		resolution: Vector2,
		camera_node: BaseCamera
	): void;
}
