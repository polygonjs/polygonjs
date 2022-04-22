import {BaseOperation} from '../_Base';
import {NodeContext} from '../../../engine/poly/NodeContext';
import {Texture} from 'three';

export class BaseCopOperation extends BaseOperation<NodeContext.COP> {
	static override context() {
		return NodeContext.COP;
	}
	override cook(input_contents: Texture[], params: any): Texture | Promise<Texture> | void {}
}
