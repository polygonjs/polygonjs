import {CATEGORY_COP} from './Category';

import {BuilderCopNode} from 'src/engine/nodes/cop/Builder';
import {EnvMapCopNode} from 'src/engine/nodes/cop/EnvMap';
import {FileCopNode} from 'src/engine/nodes/cop/File';

export interface CopNodeChildrenMap {
	builder: BuilderCopNode;
	env_map: EnvMapCopNode;
	file: FileCopNode;
}

import {Poly} from 'src/engine/Poly';
export class CopRegister {
	static run(poly: Poly) {
		poly.register_node(BuilderCopNode, CATEGORY_COP.ADVANCED);
		poly.register_node(EnvMapCopNode, CATEGORY_COP.INPUT);
		poly.register_node(FileCopNode, CATEGORY_COP.INPUT);
	}
}
