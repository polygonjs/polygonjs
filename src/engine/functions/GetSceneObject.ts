import {Texture, Material} from 'three';
import {NamedFunction1} from './_Base';
import {NodeContext} from '../poly/NodeContext';
import {CoreType} from '../../core/Type';
import {BaseCopNodeType} from '../nodes/cop/_Base';
import {BasePrimitiveMatNodeType} from '../nodes/mat/_Base';
import {getOrCreateNodeRef} from '../../core/reactivity/NodeReactivity';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';

export class getTexture extends NamedFunction1<[string]> {
	static override type() {
		return 'getTexture';
	}
	func(nodePath: string): Texture | undefined {
		dummyReadRefVal(getOrCreateNodeRef(nodePath).value);

		const node = this.scene.node(nodePath);
		if (node && node.context() == NodeContext.COP) {
			if (node && CoreType.isFunction((node as BaseCopNodeType).__textureSync__)) {
				if (node.isDirty()) {
					node.compute();
				}

				return (node as BaseCopNodeType).__textureSync__();
			}
		}
	}
}
export class getMaterial extends NamedFunction1<[string]> {
	static override type() {
		return 'getMaterial';
	}
	func(nodePath: string): Material | undefined {
		dummyReadRefVal(getOrCreateNodeRef(nodePath).value);

		const node = this.scene.node(nodePath);
		if (node && node.context() == NodeContext.MAT) {
			if (node && CoreType.isFunction((node as BasePrimitiveMatNodeType).__materialSync__)) {
				if (node.isDirty()) {
					node.compute();
				}
				return (node as BasePrimitiveMatNodeType).__materialSync__();
			}
		}
	}
}
