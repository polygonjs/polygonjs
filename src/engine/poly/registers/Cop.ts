import {CATEGORY_COP} from './Category';

// import {BuilderCopNode} from 'src/engine/nodes/cop/Builder';
import {EnvMapCopNode} from 'src/engine/nodes/cop/EnvMap';
import {FileCopNode} from 'src/engine/nodes/cop/File';
import {NullCopNode} from 'src/engine/nodes/cop/Null';
import {SwitchCopNode} from 'src/engine/nodes/cop/Switch';

export interface CopNodeChildrenMap {
	// builder: BuilderCopNode;
	env_map: EnvMapCopNode;
	file: FileCopNode;
	null: NullCopNode;
	switch: SwitchCopNode;
}

import {Poly} from 'src/engine/Poly';
export class CopRegister {
	static run(poly: Poly) {
		// poly.register_node(BuilderCopNode, CATEGORY_COP.ADVANCED);
		poly.register_node(EnvMapCopNode, CATEGORY_COP.INPUT);
		poly.register_node(FileCopNode, CATEGORY_COP.INPUT);
		poly.register_node(NullCopNode, CATEGORY_COP.MISC);
		poly.register_node(SwitchCopNode, CATEGORY_COP.MISC);
	}
}
