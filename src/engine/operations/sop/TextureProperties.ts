import {BaseSopOperation} from './_Base';
import {CoreGroup} from '../../../core/geometry/Group';
import {
	Mesh,
	Material,
	Texture,
	NoColorSpace,
	UVMapping,
	RepeatWrapping,
	ColorSpace,
	MagnificationTextureFilter,
	MinificationTextureFilter,
	AnyMapping,
	Wrapping,
} from 'three';
import {InputCloneMode} from '../../../engine/poly/InputCloneMode';
import {MAG_FILTER_DEFAULT_VALUE, MIN_FILTER_DEFAULT_VALUE} from '../../../core/cop/Filter';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {DefaultOperationParams} from '../../../core/operations/_Base';
import {filterThreejsObjects} from '../../../core/geometry/Mask';
interface TexturePropertiesSopParams extends DefaultOperationParams {
	group: string;
	// encoding
	tcolorSpace: boolean;
	colorSpace: string;
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
	static override readonly DEFAULT_PARAMS: TexturePropertiesSopParams = {
		group: '',
		// anisotropy
		tcolorSpace: false,
		colorSpace: NoColorSpace,
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
		anisotropy: 2,
		// filters
		tminFilter: false,
		minFilter: MIN_FILTER_DEFAULT_VALUE,
		tmagFilter: false,
		magFilter: MAG_FILTER_DEFAULT_VALUE,
	};
	static override readonly INPUT_CLONED_STATE = InputCloneMode.FROM_NODE;
	static override type(): Readonly<'textureProperties'> {
		return 'textureProperties';
	}

	override async cook(inputCoreGroups: CoreGroup[], params: TexturePropertiesSopParams) {
		const coreGroup = inputCoreGroups[0];

		const objects: Mesh[] = filterThreejsObjects(coreGroup, params) as Mesh[];
		const promises = objects.map((object) => this._updateObject(object, params));
		await Promise.all(promises);
		return coreGroup;
	}
	private async _updateObject(object: Mesh, params: TexturePropertiesSopParams) {
		const material = object.material as Material;
		if (!material) {
			return;
		}
		// TODO: a problem with this node,
		// is that when it cooks, the material may not already have a texture assigned
		// so it will appear to have no effect
		await this._updateMaterial(material, params);
	}
	private async _updateMaterial(material: Material, params: TexturePropertiesSopParams) {
		let texture: Texture = (material as any).map;
		if (texture) {
			await this._updateTexture(texture, params);
		}
	}
	private async _updateTexture(texture: Texture, params: TexturePropertiesSopParams) {
		this._updateColorSpace(texture, params);
		this._updateMapping(texture, params);
		this._updateWrap(texture, params);
		await this._updateAnisotropy(texture, params);
		this._updateFilter(texture, params);
	}

	private _updateColorSpace(texture: Texture, pv: TexturePropertiesSopParams) {
		if (!isBooleanTrue(pv.tcolorSpace)) {
			return;
		}
		texture.colorSpace = pv.colorSpace as ColorSpace;
		texture.needsUpdate = true;
	}
	private _updateMapping(texture: Texture, pv: TexturePropertiesSopParams) {
		if (isBooleanTrue(pv.tmapping)) {
			texture.mapping = pv.mapping as AnyMapping;
		}
	}
	private _updateWrap(texture: Texture, pv: TexturePropertiesSopParams) {
		if (isBooleanTrue(pv.twrap)) {
			texture.wrapS = pv.wrapS as Wrapping;
			texture.wrapT = pv.wrapT as Wrapping;
		}
	}

	private async _updateAnisotropy(texture: Texture, params: TexturePropertiesSopParams) {
		if (!isBooleanTrue(params.tanisotropy)) {
			return;
		}
		if (isBooleanTrue(params.useRendererMaxAnisotropy)) {
			const renderer = this._node?.scene().renderersRegister.lastRegisteredRenderer();
			if (!renderer) {
				console.warn('no renderer found');
				return;
			}
			texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		} else {
			texture.anisotropy = params.anisotropy;
		}
	}
	private _updateFilter(texture: Texture, params: TexturePropertiesSopParams) {
		if (isBooleanTrue(params.tminFilter)) {
			texture.minFilter = params.minFilter as MinificationTextureFilter;
		}
		if (isBooleanTrue(params.tmagFilter)) {
			texture.magFilter = params.magFilter as MagnificationTextureFilter;
		}
	}
}
