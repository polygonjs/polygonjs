import {CATEGORY_COP} from './Category';

import {FileCopNode} from 'src/engine/nodes/cop/File';
import {BuilderCopNode} from 'src/engine/nodes/cop/Builder';

export interface CopNodeChildrenMap {
	file: FileCopNode;
	builder: BuilderCopNode;
}

import {Poly} from 'src/engine/Poly';
export class CopRegister {
	static run(poly: Poly) {
		poly.register_node(FileCopNode, CATEGORY_COP.INPUT);
		poly.register_node(BuilderCopNode, CATEGORY_COP.ADVANCED);
	}
}
