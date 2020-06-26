import {Texture} from 'three/src/textures/Texture';
import {TypedCopNode} from './_Base';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {
	UVMapping,
	CubeReflectionMapping,
	CubeRefractionMapping,
	EquirectangularReflectionMapping,
	EquirectangularRefractionMapping,
	CubeUVReflectionMapping,
	CubeUVRefractionMapping,
	ClampToEdgeWrapping,
	RepeatWrapping,
	MirroredRepeatWrapping,
	LinearFilter,
	NearestFilter,
	NearestMipMapNearestFilter,
	NearestMipMapLinearFilter,
	LinearMipMapNearestFilter,
	LinearMipMapLinearFilter,

	// encodings
	LinearEncoding,
	sRGBEncoding,
	GammaEncoding,
	RGBEEncoding,
	LogLuvEncoding,
	RGBM7Encoding,
	RGBM16Encoding,
	RGBDEncoding,
	BasicDepthPacking,
	RGBADepthPacking,
} from 'three/src/constants';

const MAPPINGS = [
	{UVMapping},
	{CubeReflectionMapping},
	{CubeRefractionMapping},
	{EquirectangularReflectionMapping},
	{EquirectangularRefractionMapping},
	{CubeUVReflectionMapping},
	{CubeUVRefractionMapping},
];
const ENCODINGS = [
	{LinearEncoding},
	{sRGBEncoding},
	{GammaEncoding},
	{RGBEEncoding},
	{LogLuvEncoding},
	{RGBM7Encoding},
	{RGBM16Encoding},
	{RGBDEncoding},
	{BasicDepthPacking},
	{RGBADepthPacking},
];

const WRAPPINGS: Dictionary<number>[] = [{ClampToEdgeWrapping}, {RepeatWrapping}, {MirroredRepeatWrapping}];

const MAG_FILTERS: Dictionary<number>[] = [{LinearFilter}, {NearestFilter}];
const MIN_FILTERS: Dictionary<number>[] = [
	{NearestFilter},
	{NearestMipMapNearestFilter},
	{NearestMipMapLinearFilter},
	{LinearFilter},
	{LinearMipMapNearestFilter},
	{LinearMipMapLinearFilter},
];

interface TextureWithUpdateMatrix extends Texture {
	updateMatrix(): void;
}

import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';

export function TexturePropertiesParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		tencoding = ParamConfig.BOOLEAN(0);
		encoding = ParamConfig.INTEGER(LinearEncoding, {
			visible_if: {tencoding: 1},
			menu: {
				entries: ENCODINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		tmapping = ParamConfig.BOOLEAN(0);
		mapping = ParamConfig.INTEGER(UVMapping, {
			visible_if: {tmapping: 1},
			menu: {
				entries: MAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		twrap = ParamConfig.BOOLEAN(0);
		wrap_s = ParamConfig.INTEGER(Object.values(WRAPPINGS[0])[0], {
			visible_if: {twrap: 1},
			menu: {
				entries: WRAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		wrap_t = ParamConfig.INTEGER(Object.values(WRAPPINGS[0])[0], {
			visible_if: {twrap: 1},
			menu: {
				entries: WRAPPINGS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		tmag_filter = ParamConfig.BOOLEAN(0);
		mag_filter = ParamConfig.INTEGER(Object.values(MAG_FILTERS[0])[0], {
			visible_if: {tmag_filter: 1},
			menu: {
				entries: MAG_FILTERS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		tmin_filter = ParamConfig.BOOLEAN(0);
		min_filter = ParamConfig.INTEGER(Object.values(MIN_FILTERS[5])[0], {
			visible_if: {tmin_filter: 1},
			menu: {
				entries: MIN_FILTERS.map((m) => {
					return {
						name: Object.keys(m)[0],
						value: Object.values(m)[0] as number,
					};
				}),
			},
		});
		tanisotropy = ParamConfig.BOOLEAN(0);
		anisotropy = ParamConfig.INTEGER(1, {
			visible_if: {tanisotropy: 1},
			range: [0, 32],
			range_locked: [true, false],
		});
		tflip_y = ParamConfig.BOOLEAN(0);
		flip_y = ParamConfig.BOOLEAN(0, {visible_if: {tflip_y: 1}});
		ttransform = ParamConfig.BOOLEAN(0);
		offset = ParamConfig.VECTOR2([0, 0], {visible_if: {ttransform: 1}});
		repeat = ParamConfig.VECTOR2([1, 1], {visible_if: {ttransform: 1}});
		rotation = ParamConfig.FLOAT(0, {
			visible_if: {ttransform: 1},
			range: [-1, 1],
		});
		center = ParamConfig.VECTOR2([0, 0], {visible_if: {ttransform: 1}});
	};
}

class TexturePropertiesCopParamsConfig extends TexturePropertiesParamConfig(NodeParamsConfig) {}

const ParamsConfig = new TexturePropertiesCopParamsConfig();

export class TexturePropertiesCopNode extends TypedCopNode<TexturePropertiesCopParamsConfig> {
	params_config = ParamsConfig;
	static type() {
		return 'texture_properties';
	}

	initialize_node() {
		this.io.inputs.set_count(1);
		this.io.inputs.init_inputs_cloned_state([InputCloneMode.FROM_NODE]);
	}
	async cook(input_contents: Texture[]) {
		const texture = input_contents[0];
		this._update_texture_params(texture);
		this.set_texture(texture);
	}
	private _update_texture_params(texture: Texture) {
		TexturePropertiesCopNode.update_texture_params(this, texture);
	}

	static update_texture_params(node: TexturePropertiesCopNode, texture: Texture) {
		TexturePropertiesCopNode.update_texture_properties(node, texture);
		TexturePropertiesCopNode.update_texture_transform(node, texture);
	}
	static update_texture_properties(node: TexturePropertiesCopNode, texture: Texture) {
		if (node.pv.tencoding) {
			texture.encoding = node.pv.encoding;
		}
		if (node.pv.tmapping) {
			texture.mapping = node.pv.mapping;
		}
		if (node.pv.twrap) {
			texture.wrapS = node.pv.wrap_s;
			texture.wrapT = node.pv.wrap_t;
		}
		if (node.pv.tminfilter) {
			texture.minFilter = node.pv.min_filter;
		}
		if (node.pv.tminfilter) {
			texture.magFilter = node.pv.mag_filter;
		}

		if (node.pv.tanisotropy) {
			texture.anisotropy = node.pv.anisotropy;
		}
		if (node.pv.tflip_y) {
			texture.flipY = node.pv.flip_y;
		}
	}

	static update_texture_transform(node: TexturePropertiesCopNode, texture: Texture) {
		texture.offset.copy(node.pv.offset);
		texture.repeat.copy(node.pv.repeat);
		texture.rotation = node.pv.rotation;
		texture.center.copy(node.pv.center);

		(texture as TextureWithUpdateMatrix).updateMatrix();
	}
}
