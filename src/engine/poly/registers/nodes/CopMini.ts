import {CATEGORY_COP} from './Category';

import {ImageCopNode} from '../../../nodes/cop/Image';
import {VideoCopNode} from '../../../nodes/cop/Video';
import {WebCamCopNode} from '../../../nodes/cop/WebCam';

export interface CopNodeChildrenMap {
	image: ImageCopNode;
	video: VideoCopNode;
	webCam: WebCamCopNode;
}

import {PolyEngine} from '../../../Poly';
export class CopRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(ImageCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(VideoCopNode, CATEGORY_COP.INPUT);
		poly.registerNode(WebCamCopNode, CATEGORY_COP.ADVANCED);
	}
}
