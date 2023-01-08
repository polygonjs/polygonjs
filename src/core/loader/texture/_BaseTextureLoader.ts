import {BaseNodeType} from '../../../engine/nodes/_Base';
import {CoreBaseLoader} from './../_Base';

export class BaseTextureLoader extends CoreBaseLoader<string> {
	constructor(_url: string, protected override _node: BaseNodeType) {
		super(_url, _node);
	}
}
