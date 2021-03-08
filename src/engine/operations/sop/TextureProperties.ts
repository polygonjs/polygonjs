import {BaseSopOperation} from './_Base';
import {DefaultOperationParams} from '../_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {Material} from 'three/src/materials/Material';
import {Texture} from 'three/src/textures/Texture';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {Poly} from '../../../engine/Poly';

import {LinearEncoding, UVMapping, RepeatWrapping} from 'three/src/constants';

import {MAG_FILTER_DEFAULT_VALUE, MIN_FILTER_DEFAULT_VALUE} from '../../../core/cop/ConstantFilter';
import {isBooleanTrue} from '../../../core/BooleanValue';
interface TexturePropertiesSopParams extends DefaultOperationParams {
	applyToChildren: boolean;
	// encoding
	tencoding: boolean;
	encoding: number;
	// mapping
	tmapping: boolean;
	mapping: number;
	// wrap
	twrap: boolean;
	wrapS: number;
	wrapT: number;
	// anisotropy
	tanisotropy: boolean;
	useRendererMaxAnisotropy: boolean;
	anisotropy: number;
	// filters
	tminFilter: boolean;
	minFilter: number;
	tmagFilter: boolean;
	magFilter: number;
}

export class TexturePropertiesSopOperation extends BaseSopOperation {
	static readonly DEFAULT_PARAMS: TexturePropertiesSopParams = {
		applyToChildren: false,
		// anisotropy
		tencoding: false,
		encoding: LinearEncoding,
		// mapping
		tmapping: false,
		mapping: UVMapping,
		// wrap
		twrap: false,
		wrapS: RepeatWrapping,
		wrapT: RepeatWrapping,
		// anisotropy
		tanisotropy: false,
		useRendererMaxAnisotropy: false,
		anisotropy: 1,
		// filters
		tminFilter: false,
		minFilter: MIN_FILTER_DEFAULT_VALUE,
		tmagFilter: false,
		magFilter: MAG_FILTER_DEFAULT_VALUE,
	};
	static readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static type(): Readonly<'textureProperties'> {
		return 'textureProperties';
	}

	async cook(input_contents: CoreGroup[], params: TexturePropertiesSopParams) {
		const core_group = input_contents[0];

		const objects: Mesh[] = [];
		for (let object of core_group.objects() as Mesh[]) {
			if (isBooleanTrue(params.applyToChildren)) {
				object.traverse((child) => {
					objects.push(child as Mesh);
				});
			} else {
				objects.push(object);
			}
		}
		const promises = objects.map((object) => this._update_object(object, params));
		await Promise.all(promises);
		return core_group;
	}
	private async _update_object(object: Mesh, params: TexturePropertiesSopParams) {
		const material = object.material as Material;
		if (material) {
			// TODO: a problem with this node,
			// is that when it cooks, the material may not already have a texture assigned
			// so it will appear to have no effect
			await this._update_material(material, params);
		}
	}
	private async _update_material(material: Material, params: TexturePropertiesSopParams) {
		let texture: Texture = (material as any).map;
		if (texture) {
			await this._update_texture(texture, params);
		}
	}
	private async _update_texture(texture: Texture, params: TexturePropertiesSopParams) {
		this._updateEncoding(texture, params);
		this._updateMapping(texture, params);
		this._updateWrap(texture, params);
		await this._updateAnisotropy(texture, params);
		this._updateFilter(texture, params);
	}

	private _updateEncoding(texture: Texture, pv: TexturePropertiesSopParams) {
		if (!isBooleanTrue(pv.tencoding)) {
			return;
		}
		texture.encoding = pv.encoding;
		texture.needsUpdate = true;
	}
	private _updateMapping(texture: Texture, pv: TexturePropertiesSopParams) {
		if (isBooleanTrue(pv.tmapping)) {
			texture.mapping = pv.mapping;
		}
	}
	private _updateWrap(texture: Texture, pv: TexturePropertiesSopParams) {
		if (isBooleanTrue(pv.twrap)) {
			texture.wrapS = pv.wrapS;
			texture.wrapT = pv.wrapT;
		}
	}

	private async _updateAnisotropy(texture: Texture, params: TexturePropertiesSopParams) {
		if (!isBooleanTrue(params.tanisotropy)) {
			return;
		}
		if (isBooleanTrue(params.useRendererMaxAnisotropy)) {
			const renderer = await Poly.renderersController.firstRenderer();
			if (renderer) {
				texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
			}
		} else {
			texture.anisotropy = params.anisotropy;
		}
	}
	private _updateFilter(texture: Texture, params: TexturePropertiesSopParams) {
		if (isBooleanTrue(params.tminFilter)) {
			texture.minFilter = params.minFilter;
		}
		if (isBooleanTrue(params.tmagFilter)) {
			texture.magFilter = params.magFilter;
		}
	}
}
