import {TypedNode} from '../_Base';
import {TextureContainer} from 'src/engine/containers/Texture';
import {Texture} from 'three/src/textures/Texture';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {PolyScene} from 'src/engine/scene/PolyScene';
import {FlagsControllerB} from '../utils/FlagsController';

export class TypedCopNode<K extends NodeParamsConfig> extends TypedNode<'TEXTURE', BaseCopNodeType, K> {
	container_controller: TypedContainerController<TextureContainer> = new TypedContainerController<TextureContainer>(
		this,
		TextureContainer
	);
	public readonly flags: FlagsControllerB = new FlagsControllerB(this);
	protected _texture: Texture | undefined;

	static node_context(): NodeContext {
		return NodeContext.COP;
	}

	constructor(scene: PolyScene) {
		super(scene, 'BaseCopNode');
	}

	initialize_base_node() {
		// this.flags.add_bypass();

		// this.flags.add_display();
		// if (this.flags.display) {
		// 	this.flags.display.set(false);
		// }
		this.io.outputs.set_has_one_output();
		// this.container_controller.init(CONTAINER_CLASS);
	}

	set_texture(texture: Texture) {
		this.set_container(texture);
	}
}

export type BaseCopNodeType = TypedCopNode<any>;
export class BaseCopNodeClass extends TypedCopNode<any> {}
