import {CATEGORY_COP} from './Category';

import {BuilderCopNode} from '../../../nodes/cop/Builder';
import {ColorCopNode} from '../../../nodes/cop/Color';
import {EnvMapCopNode} from '../../../nodes/cop/EnvMap';
import {FileCopNode} from '../../../nodes/cop/File';
import {MapboxTileCopNode} from '../../../nodes/cop/MapboxTile';
import {NullCopNode} from '../../../nodes/cop/Null';
import {PostCopNode} from '../../../nodes/cop/Post';
import {SwitchCopNode} from '../../../nodes/cop/Switch';
import {TexturePropertiesCopNode} from '../../../nodes/cop/TextureProperties';

export interface CopNodeChildrenMap {
	builder: BuilderCopNode;
	color: ColorCopNode;
	env_map: EnvMapCopNode;
	file: FileCopNode;
	mapbox_tile: MapboxTileCopNode;
	Post: PostCopNode;
	null: NullCopNode;
	switch: SwitchCopNode;
	texture_properties: TexturePropertiesCopNode;
}

import {Poly} from '../../../Poly';
export class CopRegister {
	static run(poly: Poly) {
		poly.register_node(BuilderCopNode, CATEGORY_COP.ADVANCED);
		poly.register_node(ColorCopNode, CATEGORY_COP.INPUT);
		poly.register_node(EnvMapCopNode, CATEGORY_COP.INPUT);
		poly.register_node(FileCopNode, CATEGORY_COP.INPUT);
		poly.register_node(MapboxTileCopNode, CATEGORY_COP.INPUT);
		poly.register_node(NullCopNode, CATEGORY_COP.MISC);
		poly.register_node(PostCopNode, CATEGORY_COP.FILTER);
		poly.register_node(SwitchCopNode, CATEGORY_COP.MISC);
		poly.register_node(TexturePropertiesCopNode, CATEGORY_COP.ADVANCED);
	}
}
