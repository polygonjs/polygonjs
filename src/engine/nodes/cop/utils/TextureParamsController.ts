import {Constructor} from '../../../../types/GlobalTypes';
import {TypedCopNode} from '../_Base';
import {Texture} from 'three';
import {RGBAFormat, UnsignedByteType, LinearEncoding, UVMapping, RepeatWrapping, LinearFilter} from 'three';
import {
	MAG_FILTERS,
	MAG_FILTER_DEFAULT_VALUE,
	MAG_FILTER_MENU_ENTRIES,
	MIN_FILTERS,
	MIN_FILTER_DEFAULT_VALUE,
	MIN_FILTER_MENU_ENTRIES,
} from '../../../../core/cop/Filter';

import {NodeParamsConfig, ParamConfig} from '../../utils/params/ParamsConfig';
import {CopRendererController} from './RendererController';
import {BaseNodeType} from '../../_Base';
import {isBooleanTrue} from '../../../../core/BooleanValue';
import {ParamsValueAccessorType} from '../../utils/params/ParamsValueAccessor';
import {ENCODINGS} from '../../../../core/cop/Encoding';
import {WRAPPINGS} from '../../../../core/cop/Wrapping';
import {MAPPINGS} from '../../../../core/cop/Mapping';
import {TEXTURE_TYPES} from '../../../../core/cop/Type';
import {TEXTURE_FORMATS} from '../../../../core/cop/Format';

type AvailableCallbackMethod = Extract<
	keyof typeof TextureParamsController,
	| 'PARAM_CALLBACK_update_encoding'
	| 'PARAM_CALLBACK_update_mapping'
	| 'PARAM_CALLBACK_update_wrap'
	| 'PARAM_CALLBACK_update_filter'
	| 'PARAM_CALLBACK_update_anisotropy'
	| 'PARAM_CALLBACK_update_flipY'
	| 'PARAM_CALLBACK_update_transform'
	| 'PARAM_CALLBACK_update_repeat'
	| 'PARAM_CALLBACK_update_offset'
	| 'PARAM_CALLBACK_update_center'
	| 'PARAM_CALLBACK_update_rotation'
	| 'PARAM_CALLBACK_update_advanced'
>;

function callbackParams(method: AvailableCallbackMethod) {
	return {
		cook: false,
		callback: (node: BaseNodeType) => {
			TextureParamsController[method](node as TextureCopNode);
		},
	};
}

const DEFAULT = {
	ENCODING: LinearEncoding,
	FORMAT: RGBAFormat,
	MAPPING: UVMapping,
	MIN_FILTER: LinearFilter,
	MAG_FILTER: LinearFilter,
	TYPE: UnsignedByteType,
	WRAPPING: RepeatWrapping,
};

const CALLBACK_PARAMS_ENCODING = callbackParams('PARAM_CALLBACK_update_encoding');
const CALLBACK_PARAMS_MAPPING = callbackParams('PARAM_CALLBACK_update_mapping');
const CALLBACK_PARAMS_WRAP = callbackParams('PARAM_CALLBACK_update_wrap');
const CALLBACK_PARAMS_FILTER = callbackParams('PARAM_CALLBACK_update_filter');
const CALLBACK_PARAMS_ANISOTROPY = callbackParams('PARAM_CALLBACK_update_anisotropy');
const CALLBACK_PARAMS_FLIPY = callbackParams('PARAM_CALLBACK_update_flipY');
const CALLBACK_PARAMS_TRANSFORM_TRANSFORM = callbackParams('PARAM_CALLBACK_update_transform');
const CALLBACK_PARAMS_TRANSFORM_REPEAT = callbackParams('PARAM_CALLBACK_update_repeat');
const CALLBACK_PARAMS_TRANSFORM_OFFSET = callbackParams('PARAM_CALLBACK_update_offset');
const CALLBACK_PARAMS_TRANSFORM_ROTATION = callbackParams('PARAM_CALLBACK_update_rotation');
const CALLBACK_PARAMS_TRANSFORM_CENTER = callbackParams('PARAM_CALLBACK_update_center');
const CALLBACK_PARAMS_ADVANCED = callbackParams('PARAM_CALLBACK_update_advanced');

interface TextureParamConfigDefaults {
	tencoding: boolean | number;
	encoding: number;
}
export function TextureParamConfig<TBase extends Constructor>(Base: TBase, defaults?: TextureParamConfigDefaults) {
	return class Mixin extends Base {
		/** @param toggle on to allow updating the texture encoding */
		tencoding = ParamConfig.BOOLEAN(defaults?.tencoding || 0, {
			...CALLBACK_PARAMS_ENCODING,
		});
		/** @param sets the texture encoding */
		encoding = ParamConfig.INTEGER(defaults?.encoding || DEFAULT.ENCODING, {
			visibleIf: {tencoding: 1},
			menu: {
				entries: ENCODINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
			...CALLBACK_PARAMS_ENCODING,
		});

		/** @param toggle on to allow updating the texture mapping */
		tmapping = ParamConfig.BOOLEAN(0, {
			...CALLBACK_PARAMS_MAPPING,
		});
		/** @param sets the texture mapping */
		mapping = ParamConfig.INTEGER(DEFAULT.MAPPING, {
			visibleIf: {tmapping: 1},
			menu: {
				entries: MAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
			...CALLBACK_PARAMS_MAPPING,
		});
		/** @param toggle on to allow updating the texture wrap */
		twrap = ParamConfig.BOOLEAN(0, {
			...CALLBACK_PARAMS_WRAP,
		});
		/** @param sets the texture wrapS */
		wrapS = ParamConfig.INTEGER(DEFAULT.WRAPPING, {
			visibleIf: {twrap: 1},
			menu: {
				entries: WRAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
			...CALLBACK_PARAMS_WRAP,
		});
		/** @param sets the texture wrapT */
		wrapT = ParamConfig.INTEGER(DEFAULT.WRAPPING, {
			visibleIf: {twrap: 1},
			menu: {
				entries: WRAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
			separatorAfter: true,
			...CALLBACK_PARAMS_WRAP,
		});
		/** @param toggle on to allow updating the texture min filter */
		tminFilter = ParamConfig.BOOLEAN(0, {
			...CALLBACK_PARAMS_FILTER,
		});
		/** @param sets the texture min filter */
		minFilter = ParamConfig.INTEGER(MIN_FILTER_DEFAULT_VALUE, {
			visibleIf: {tminFilter: 1},
			menu: {
				entries: MIN_FILTER_MENU_ENTRIES,
			},
			...CALLBACK_PARAMS_FILTER,
		});
		/** @param toggle on to allow updating the texture mag filter */
		tmagFilter = ParamConfig.BOOLEAN(0, {
			...CALLBACK_PARAMS_FILTER,
		});
		/** @param sets the texture mag filter */
		magFilter = ParamConfig.INTEGER(MAG_FILTER_DEFAULT_VALUE, {
			visibleIf: {tmagFilter: 1},
			menu: {
				entries: MAG_FILTER_MENU_ENTRIES,
			},
			...CALLBACK_PARAMS_FILTER,
		});
		/** @param toggle on to allow updating the texture anisotropy */
		tanisotropy = ParamConfig.BOOLEAN(0, {
			...CALLBACK_PARAMS_ANISOTROPY,
		});
		/** @param sets the anisotropy from the max value allowed by the renderer */
		useRendererMaxAnisotropy = ParamConfig.BOOLEAN(0, {
			visibleIf: {tanisotropy: 1},
			...CALLBACK_PARAMS_ANISOTROPY,
		});
		/** @param sets the anisotropy manually */
		anisotropy = ParamConfig.INTEGER(2, {
			visibleIf: {tanisotropy: 1, useRendererMaxAnisotropy: 0},
			range: [0, 32],
			rangeLocked: [true, false],
			...CALLBACK_PARAMS_ANISOTROPY,
		});

		/** @param Toggle on to update the flipY */
		tflipY = ParamConfig.BOOLEAN(0, {
			...CALLBACK_PARAMS_FLIPY,
		});
		/** @param sets the flipY */
		flipY = ParamConfig.BOOLEAN(0, {
			visibleIf: {tflipY: 1},
			...CALLBACK_PARAMS_FLIPY,
		});

		/** @param toggle on to update the texture transform */
		ttransform = ParamConfig.BOOLEAN(0, {
			...CALLBACK_PARAMS_TRANSFORM_TRANSFORM,
		});
		/** @param updates the texture offset */
		offset = ParamConfig.VECTOR2([0, 0], {
			visibleIf: {ttransform: 1},
			...CALLBACK_PARAMS_TRANSFORM_OFFSET,
		});
		/** @param updates the texture repeat */
		repeat = ParamConfig.VECTOR2([1, 1], {
			visibleIf: {ttransform: 1},
			...CALLBACK_PARAMS_TRANSFORM_REPEAT,
		});
		/** @param updates the texture rotation */
		rotation = ParamConfig.FLOAT(0, {
			range: [-1, 1],
			visibleIf: {ttransform: 1},
			...CALLBACK_PARAMS_TRANSFORM_ROTATION,
		});
		/** @param updates the texture center */
		center = ParamConfig.VECTOR2([0, 0], {
			visibleIf: {ttransform: 1},
			...CALLBACK_PARAMS_TRANSFORM_CENTER,
		});

		/** @param toggle on to display advanced parameters */
		tadvanced = ParamConfig.BOOLEAN(0, {
			...CALLBACK_PARAMS_ADVANCED,
		});
		/** @param toggle on to allow overriding the texture format */
		tformat = ParamConfig.BOOLEAN(0, {
			visibleIf: {tadvanced: 1},
			...CALLBACK_PARAMS_ADVANCED,
		});
		/** @param sets the texture format */
		format = ParamConfig.INTEGER(DEFAULT.FORMAT, {
			visibleIf: {tadvanced: 1, tformat: 1},
			menu: {
				entries: TEXTURE_FORMATS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
			...CALLBACK_PARAMS_ADVANCED,
		});

		/** @param toggle on to allow overriding the texture type */
		ttype = ParamConfig.BOOLEAN(0, {
			visibleIf: {tadvanced: 1},
			...CALLBACK_PARAMS_ADVANCED,
		});
		/** @param sets the texture ty[e] */
		type = ParamConfig.INTEGER(DEFAULT.TYPE, {
			visibleIf: {tadvanced: 1, ttype: 1},
			menu: {
				entries: TEXTURE_TYPES.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
			...CALLBACK_PARAMS_ADVANCED,
		});
	};
}

// export function TextureParamConfigFactory<TBase extends Constructor>(defaults: TextureParamConfigDefaults) {
// 	return (Base: TBase) => {
// 		return TextureParamConfig(Base, defaults);
// 	};
// }

class CopTextureParamsConfig extends TextureParamConfig(NodeParamsConfig) {}
const ParamsConfig = new CopTextureParamsConfig();
class TextureCopNode extends TypedCopNode<CopTextureParamsConfig> {
	override paramsConfig = ParamsConfig;
	public readonly textureParamsController = new TextureParamsController(this);
}

export class TextureParamsController {
	constructor(protected node: TextureCopNode) {}
	async update(texture: Texture) {
		const pv = this.node.pv;
		this._updateEncoding(texture, pv);
		this._updateAdvanced(texture, pv);
		this._updateMapping(texture, pv);
		this._updateWrap(texture, pv);
		this._updateFilter(texture, pv);
		this._updateFlip(texture, pv);
		await this._updateAnisotropy(texture, pv);
		this._updateTransform(texture);
	}
	private _updateEncoding(texture: Texture, pv: ParamsValueAccessorType<CopTextureParamsConfig>) {
		if (isBooleanTrue(pv.tencoding)) {
			texture.encoding = pv.encoding;
		} else {
			texture.encoding = DEFAULT.ENCODING;
		}
		console.log('set encoding', texture.encoding);
		texture.needsUpdate = true;
	}
	private _updateAdvanced(texture: Texture, pv: ParamsValueAccessorType<CopTextureParamsConfig>) {
		if (isBooleanTrue(pv.tadvanced)) {
			if (isBooleanTrue(pv.tformat)) {
				texture.format = pv.format;
			} else {
				texture.format = DEFAULT.FORMAT;
			}
			if (isBooleanTrue(pv.ttype)) {
				texture.type = pv.type;
			} else {
				texture.type = DEFAULT.TYPE;
			}
		}
		texture.needsUpdate = true;
	}
	private _updateMapping(texture: Texture, pv: ParamsValueAccessorType<CopTextureParamsConfig>) {
		if (isBooleanTrue(pv.tmapping)) {
			texture.mapping = pv.mapping;
		} else {
			texture.mapping = DEFAULT.MAPPING;
		}
		texture.needsUpdate = true;
	}
	private _updateWrap(texture: Texture, pv: ParamsValueAccessorType<CopTextureParamsConfig>) {
		if (isBooleanTrue(pv.twrap)) {
			texture.wrapS = pv.wrapS;
			texture.wrapT = pv.wrapT;
		} else {
			texture.wrapS = DEFAULT.WRAPPING;
			texture.wrapT = DEFAULT.WRAPPING;
		}
		texture.needsUpdate = true;
	}
	private _updateFilter(texture: Texture, pv: ParamsValueAccessorType<CopTextureParamsConfig>) {
		if (isBooleanTrue(pv.tminFilter)) {
			texture.minFilter = pv.minFilter;
		} else {
			// It makes more sense to:
			// - use LinearFilter by default when tfilter is off
			// - show LinearMipMapLinearFilter + LinearFilter when on to show the right combination.
			// rather than:
			// - use LinearMipMapLinearFilter + LinearFilter
			// as this would not work when importing a texture to be fed to a cop/envMap
			texture.minFilter = LinearFilter;
		}
		if (isBooleanTrue(pv.tmagFilter)) {
			texture.magFilter = pv.magFilter;
		} else {
			texture.magFilter = LinearFilter;
		}
		texture.needsUpdate = true;
	}
	private _updateFlip(texture: Texture, pv: ParamsValueAccessorType<CopTextureParamsConfig>) {
		// do not have this in an if block,
		// as to be sure this is set to false in case it is set to true
		// by the texture loader
		texture.flipY = pv.tflipY && pv.flipY;
		texture.needsUpdate = true;
	}

	private _rendererController: CopRendererController | undefined;
	private async _updateAnisotropy(texture: Texture, pv: ParamsValueAccessorType<CopTextureParamsConfig>) {
		if (!isBooleanTrue(pv.tanisotropy)) {
			texture.anisotropy = 1;
			return;
		}

		if (isBooleanTrue(pv.useRendererMaxAnisotropy)) {
			texture.anisotropy = await this._maxRendererAnisotropy();
		} else {
			const anisotropy = pv.anisotropy;
			// if the requested anisotropy is 2 or less,
			// we can assume that the current renderer can provide it,
			// without having to wait for it to be created
			if (anisotropy <= 2) {
				texture.anisotropy = anisotropy;
			} else {
				texture.anisotropy = Math.min(anisotropy, await this._maxRendererAnisotropy());
			}
		}
		texture.needsUpdate = true;
	}
	private async _maxRendererAnisotropy() {
		this._rendererController = this._rendererController || new CopRendererController(this.node);
		const renderer = await this._rendererController.waitForRenderer();
		const max_anisotropy = renderer.capabilities.getMaxAnisotropy();
		return max_anisotropy;
	}

	private _updateTransform(texture: Texture) {
		if (!isBooleanTrue(this.node.pv.ttransform)) {
			texture.offset.set(0, 0);
			texture.rotation = 0;
			texture.repeat.set(1, 1);
			texture.center.set(0, 0);
			return;
		}
		this._updateTransformOffset(texture, false);
		this._updateTransformRepeat(texture, false);
		this._updateTransformRotation(texture, false);
		this._updateTransformCenter(texture, false);
		texture.updateMatrix();
	}
	private async _updateTransformOffset(texture: Texture, updateMatrix: boolean) {
		texture.offset.copy(this.node.pv.offset);
		if (updateMatrix) {
			texture.updateMatrix();
		}
	}
	private async _updateTransformRepeat(texture: Texture, updateMatrix: boolean) {
		texture.repeat.copy(this.node.pv.repeat);
		if (updateMatrix) {
			texture.updateMatrix();
		}
	}
	private async _updateTransformRotation(texture: Texture, updateMatrix: boolean) {
		texture.rotation = this.node.pv.rotation;
		if (updateMatrix) {
			texture.updateMatrix();
		}
	}
	private async _updateTransformCenter(texture: Texture, updateMatrix: boolean) {
		texture.center.copy(this.node.pv.center);
		if (updateMatrix) {
			texture.updateMatrix();
		}
	}
	//
	//
	// CALLBACK
	//
	//
	static PARAM_CALLBACK_update_encoding(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateEncoding(texture, node.pv);
	}
	static PARAM_CALLBACK_update_mapping(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateMapping(texture, node.pv);
	}
	static PARAM_CALLBACK_update_wrap(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateWrap(texture, node.pv);
	}
	static PARAM_CALLBACK_update_filter(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateFilter(texture, node.pv);
	}
	static PARAM_CALLBACK_update_anisotropy(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateAnisotropy(texture, node.pv);
	}
	static PARAM_CALLBACK_update_flipY(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateFlip(texture, node.pv);
	}
	static PARAM_CALLBACK_update_transform(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateTransform(texture);
	}
	static PARAM_CALLBACK_update_offset(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateTransformOffset(texture, true);
	}
	static PARAM_CALLBACK_update_repeat(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateTransformRepeat(texture, true);
	}
	static PARAM_CALLBACK_update_rotation(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateTransformRotation(texture, true);
	}
	static PARAM_CALLBACK_update_center(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateTransformCenter(texture, true);
	}
	static PARAM_CALLBACK_update_advanced(node: TextureCopNode) {
		const texture = node.containerController.container().texture();
		if (!texture) {
			return;
		}
		node.textureParamsController._updateAdvanced(texture, node.pv);
	}
	//
	//
	// UTILS
	//
	//
	static copyTextureAttributes(texture: Texture, inputTexture: Texture) {
		texture.encoding = inputTexture.encoding;
		texture.mapping = inputTexture.mapping;
		texture.wrapS = inputTexture.wrapS;
		texture.wrapT = inputTexture.wrapT;
		texture.minFilter = inputTexture.minFilter;
		texture.magFilter = inputTexture.magFilter;
		texture.magFilter = inputTexture.magFilter;
		texture.anisotropy = inputTexture.anisotropy;
		texture.flipY = inputTexture.flipY;
		texture.repeat.copy(inputTexture.repeat);
		texture.offset.copy(inputTexture.offset);
		texture.center.copy(inputTexture.center);
		texture.rotation = inputTexture.rotation;
		texture.type = inputTexture.type;
		texture.format = inputTexture.format;
		texture.needsUpdate = true;
	}
	paramLabelsParams() {
		const p = this.node.p;
		return [
			// encoding
			p.tencoding,
			p.encoding,
			// mapping
			p.tmapping,
			p.mapping,
			// wrap
			p.twrap,
			p.wrapS,
			p.wrapT,
			// filter
			p.tminFilter,
			p.minFilter,
			p.tmagFilter,
			p.magFilter,
			// flipY
			p.tflipY,
			p.flipY,
		];
	}
	paramLabels() {
		const labels: string[] = [];
		const pv = this.node.pv;
		if (isBooleanTrue(pv.tencoding)) {
			for (let encoding of ENCODINGS) {
				const encodingName = Object.keys(encoding)[0];
				const encodingValue = (encoding as any)[encodingName];
				if (encodingValue == pv.encoding) {
					labels.push(`encoding: ${encodingName}`);
				}
			}
		}
		if (isBooleanTrue(pv.tmapping)) {
			for (let mapping of MAPPINGS) {
				const mappingName = Object.keys(mapping)[0];
				const mappingValue = (mapping as any)[mappingName];
				if (mappingValue == pv.mapping) {
					labels.push(`mapping: ${mappingName}`);
				}
			}
		}
		if (isBooleanTrue(pv.twrap)) {
			function setWrapping(wrappingAxis: 'wrapS' | 'wrapT') {
				for (let wrapping of WRAPPINGS) {
					const wrappingName = Object.keys(wrapping)[0];
					const wrappingValue = (wrapping as any)[wrappingName];
					if (wrappingValue == pv[wrappingAxis]) {
						labels.push(`${wrappingAxis}: ${wrappingName}`);
					}
				}
			}
			setWrapping('wrapS');
			setWrapping('wrapT');
		}
		if (isBooleanTrue(pv.tminFilter)) {
			for (let minFilter of MIN_FILTERS) {
				const minFilterName = Object.keys(minFilter)[0];
				const minFilterValue = (minFilter as any)[minFilterName];
				if (minFilterValue == pv.minFilter) {
					labels.push(`minFilter: ${minFilterName}`);
				}
			}
		}
		if (isBooleanTrue(pv.tmagFilter)) {
			for (let magFilter of MAG_FILTERS) {
				const magFilterName = Object.keys(magFilter)[0];
				const magFilterValue = (magFilter as any)[magFilterName];
				if (magFilterValue == pv.magFilter) {
					labels.push(`magFilter: ${magFilterName}`);
				}
			}
		}
		if (isBooleanTrue(pv.tflipY)) {
			labels.push(`flipY: ${pv.flipY}`);
		}

		return labels;
	}
}
