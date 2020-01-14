import {TypedNode} from '../_Base';
import {TextureContainer} from 'src/engine/containers/Texture';
import {Texture} from 'three/src/textures/Texture';
import {TypedContainerController} from '../utils/ContainerController';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {PolyScene} from 'src/engine/scene/PolyScene';

export class TypedCopNode<K extends NodeParamsConfig> extends TypedNode<'TEXTURE', K> {
	container_controller: TypedContainerController<TextureContainer> = new TypedContainerController<TextureContainer>(
		this,
		TextureContainer
	);
	static node_context(): NodeContext {
		return NodeContext.COP;
	}

	constructor(scene: PolyScene) {
		super(scene, 'BaseCopNode');
	}

	set_texture(texture: Texture) {
		this.set_container(texture);
	}
}

export type BaseCopNodeType = TypedCopNode<any>;
export class BaseCopNodeClass extends TypedCopNode<any> {}
