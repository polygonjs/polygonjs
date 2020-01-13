import {Texture} from 'three/src/textures/Texture';
import {BaseNode} from '../_Base';
import {TextureContainer} from 'src/engine/containers/Texture';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {PolyScene} from 'src/engine/scene/PolyScene';

export class BaseCopNode extends BaseNode {
	static node_context(): NodeContext {
		return NodeContext.COP;
	}

	constructor(scene: PolyScene) {
		super(scene, 'BaseCopNode');
		this.container_controller.init(TextureContainer);
	}

	set_texture(texture: Texture) {
		this.set_container(texture);
	}
}
