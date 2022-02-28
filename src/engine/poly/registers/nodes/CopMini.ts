import {CATEGORY_COP} from './Category';

import {EnvMapCopNode} from '../../../nodes/cop/EnvMap';
import {ImageCopNode} from '../../../nodes/cop/Image';
import {VideoCopNode} from '../../../nodes/cop/Video';

export interface CopNodeChildrenMap {
	envMap: EnvMapCopNode;
	image: ImageCopNode;
	video: VideoCopNode;
}

import {PolyEngine} from '../../../Poly';
export class CopRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(EnvMapCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(ImageCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(VideoCopNode, CATEGORY_COP.INPUT);
	}
}
