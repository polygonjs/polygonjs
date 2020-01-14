import {CATEGORY_SOP} from './Category';

import {BoxSopNode} from 'src/engine/nodes/sop/Box';
import {TransformSopNode} from 'src/engine/nodes/sop/Transform';

import {Poly} from 'src/engine/Poly';
export class SopRegister {
	static run(poly: Poly) {
		poly.register_node(BoxSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(TransformSopNode, CATEGORY_SOP.MODIFIER);
	}
}
