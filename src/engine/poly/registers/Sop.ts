import {CATEGORY_SOP} from './Category';

import {BoxSopNode} from 'src/engine/nodes/sop/Box';
import {ColorSopNode} from 'src/engine/nodes/sop/Color';
import {TextSopNode} from 'src/engine/nodes/sop/Text';
import {TransformSopNode} from 'src/engine/nodes/sop/Transform';

export interface GeoNodeChildrenMap {
	box: BoxSopNode;
	color: ColorSopNode;
	text: TextSopNode;
	transform: TransformSopNode;
}

import {Poly} from 'src/engine/Poly';
export class SopRegister {
	static run(poly: Poly) {
		poly.register_node(BoxSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(ColorSopNode, CATEGORY_SOP.MODIFIER);
		poly.register_node(TextSopNode, CATEGORY_SOP.INPUT);
		poly.register_node(TransformSopNode, CATEGORY_SOP.MODIFIER);
	}
}
