import {Material, Texture} from 'three';
import {BaseCopNodeType} from '../../cop/_Base';
import {BaseNodeType} from '../../_Base';

export type MaterialTexturesRecord = Map<string, Texture | null>;
export type SetParamsTextureNodesRecord = Map<string, BaseCopNodeType>;
export abstract class BaseController {
	constructor(protected node: BaseNodeType) {}
	// add_params() {}

	initializeNode() {}
	abstract updateMaterial(material: Material): void | Promise<void>;
	setParamsFromMaterial(material: Material, record: SetParamsTextureNodesRecord) {}
	getTextures(material: Material, record: MaterialTexturesRecord) {}

	// get material() {
	// 	return this.node.material;
	// }
}
