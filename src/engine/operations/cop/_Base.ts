import {BaseOperation} from '../_Base';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {Texture} from 'three/src/textures/Texture';

export class BaseCopOperation extends BaseOperation<NodeContext.COP> {
	static context() {
		return NodeContext.COP;
	}
	cook(input_contents: Texture[], params: any): Texture | Promise<Texture> | void {}
}
