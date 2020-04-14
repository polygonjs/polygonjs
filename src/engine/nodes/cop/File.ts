import {VideoTexture} from 'three/src/textures/VideoTexture';
import {
	UVMapping,
	CubeReflectionMapping,
	CubeRefractionMapping,
	EquirectangularReflectionMapping,
	EquirectangularRefractionMapping,
	SphericalReflectionMapping,
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
	// UnsignedByteType,
	// ByteType,
	// ShortType,
	// UnsignedShortType,
	// IntType,
	// UnsignedIntType,
	// FloatType,
	// HalfFloatType,
	// UnsignedShort4444Type,
	// UnsignedShort5551Type,
	// UnsignedShort565Type,
	// UnsignedInt248Type,
	// AlphaFormat,
	// RGBFormat,
	// RGBAFormat,
	// LuminanceFormat,
	// LuminanceAlphaFormat,
	// RGBEFormat,
	// DepthFormat,
	// DepthStencilFormat,
	// LinearEncoding,
	// sRGBEncoding,
	// GammaEncoding,
	// RGBEEncoding,
	// LogLuvEncoding,
	// RGBM7Encoding,
	// RGBM16Encoding,
	// RGBDEncoding,
	// BasicDepthPacking,
	// RGBADepthPacking,
} from 'three/src/constants';
import {Texture} from 'three/src/textures/Texture';

import {TypedCopNode} from './_Base';
import {CoreTextureLoader} from '../../../core/loader/Texture';

const MAPPINGS = [
	{UVMapping},
	{CubeReflectionMapping},
	{CubeRefractionMapping},
	{EquirectangularReflectionMapping},
	{EquirectangularRefractionMapping},
	{SphericalReflectionMapping},
	{CubeUVReflectionMapping},
	{CubeUVRefractionMapping},
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

// const TYPES = [
// 	"UnsignedByteType",
// 	"ByteType",
// 	"ShortType",
// 	"UnsignedShortType",
// 	"IntType",
// 	"UnsignedIntType",
// 	"FloatType",
// 	"HalfFloatType",
// 	"UnsignedShort4444Type",
// 	"UnsignedShort5551Type",
// 	"UnsignedShort565Type",
// 	"UnsignedInt248Type"
// ];

// const FORMATS = [
// 	"AlphaFormat",
// 	"RGBFormat",
// 	"RGBAFormat",
// 	"LuminanceFormat",
// 	"LuminanceAlphaFormat",
// 	"RGBEFormat",
// 	"DepthFormat",
// 	"DepthStencilFormat"
// ];

// const ENCODINGS = [
// 	"LinearEncoding",
// 	"sRGBEncoding",
// 	"GammaEncoding",
// 	"RGBEEncoding",
// 	"LogLuvEncoding",
// 	"RGBM7Encoding",
// 	"RGBM16Encoding",
// 	"RGBDEncoding",
// 	"BasicDepthPacking",
// 	"RGBADepthPacking"
// ];

interface AttribMapping {
	mapping: string;
	wrapS: string;
	wrapT: string;
	minFilter: string;
	magFilter: string;
}
const ATTRIB_MAPPING_KEYS: Array<keyof AttribMapping> = ['mapping', 'wrapS', 'wrapT', 'minFilter', 'magFilter'];
const ATTRIB_MAPPING: AttribMapping = {
	mapping: 'mapping',
	wrapS: 'wrap_s',
	wrapT: 'wrap_t',
	minFilter: 'min_filter',
	magFilter: 'mag_filter',
	// type: 'type',
	// encoding: 'encoding'
	// format: 'format',
};

import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
class FileCopParamsConfig extends NodeParamsConfig {
	//
	url = ParamConfig.STRING(CoreTextureLoader.PARAM_DEFAULT, {
		desktop_browse: {file_type: 'texture'},
	});
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			FileCopNode.PARAM_CALLBACK_reload(node as FileCopNode, param);
		},
	});
	mapping = ParamConfig.INTEGER(UVMapping, {
		menu: {
			entries: MAPPINGS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
	});
	wrap_s = ParamConfig.INTEGER(Object.values(WRAPPINGS[0])[0], {
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
		menu: {
			entries: WRAPPINGS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
	});
	mag_filter = ParamConfig.INTEGER(Object.values(MAG_FILTERS[0])[0], {
		menu: {
			entries: MAG_FILTERS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
	});
	min_filter = ParamConfig.INTEGER(Object.values(MIN_FILTERS[0])[0], {
		menu: {
			entries: MIN_FILTERS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
	});
	is_video = ParamConfig.BOOLEAN(0, {
		hidden: true,
		cook: false,
	});
	play = ParamConfig.BOOLEAN(1, {
		visible_if: {is_video: 1},
		cook: false,
		callback: (node: BaseNodeType) => {
			FileCopNode.PARAM_CALLBACK_video_update_play(node as FileCopNode);
		},
	});
	muted = ParamConfig.BOOLEAN(1, {
		visible_if: {is_video: 1},
		cook: false,
		callback: (node: BaseNodeType) => {
			FileCopNode.PARAM_CALLBACK_video_update_muted(node as FileCopNode);
		},
	});
	loop = ParamConfig.BOOLEAN(1, {
		visible_if: {is_video: 1},
		cook: false,
		callback: (node: BaseNodeType) => {
			FileCopNode.PARAM_CALLBACK_video_update_loop(node as FileCopNode);
		},
	});
	video_time = ParamConfig.FLOAT('$T', {
		visible_if: {is_video: 1},
		cook: false,
		// do not use video_time, as calling "this._video.currentTime =" every frame is really expensive
		// compute_on_dirty: true,
		// callback: (node: BaseNodeType) => {
		// 	FileCopNode.PARAM_CALLBACK_update_video_time(node as FileCopNode);
		// },
	});
	set_video_time = ParamConfig.BUTTON(null, {
		visible_if: {is_video: 1},
		cook: false,
		callback: (node: BaseNodeType) => {
			FileCopNode.PARAM_CALLBACK_video_update_time(node as FileCopNode);
		},
	});
}

const ParamsConfig = new FileCopParamsConfig();

export class FileCopNode extends TypedCopNode<FileCopParamsConfig> {
	params_config = ParamsConfig;
	private _video: HTMLVideoElement | undefined;

	static type() {
		return 'file';
	}

	private _texture_loader: CoreTextureLoader | undefined;

	static readonly VIDEO_TIME_PARAM_NAME = 'video_time';
	static readonly DEFAULT_NODE_PATH = {
		UV: '/COP/file_uv',
		ENV_MAP: '/COP/env_map',
	};
	static readonly VIDEO_EXTENSIONS = ['mp4', 'ogv'];

	async cook() {
		if (this._is_static_image_url(this.pv.url)) {
			await this.cook_for_image();
		} else {
			await this.cook_for_video();
		}
	}

	private _is_static_image_url(url: string) {
		const url_without_query_params = url.split('?')[0];
		const url_elements = url_without_query_params.split('.');
		const ext = url_elements[url_elements.length - 1];
		return !FileCopNode.VIDEO_EXTENSIONS.includes(ext);
	}

	private async cook_for_image() {
		this.p.is_video.set(0);
		const texture = await this._load_texture(this.pv.url);

		if (texture) {
			this._update_texture_params(texture);
			this.set_texture(texture);
		} else {
			this.clear_texture();
		}
	}

	private async cook_for_video() {
		this.p.is_video.set(1);
		const texture = await this._load_texture(this.pv.url);

		if (texture) {
			this._video = texture.image;

			this.video_update_loop();
			this.video_update_muted();
			this.video_update_play();
			this.video_update_time();
			this._update_texture_params(texture);
			this.set_texture(texture);
		} else {
			this.cook_controller.end_cook();
		}
	}

	resolved_url() {
		return this.pv.url;
	}

	private _update_texture_params(texture: Texture) {
		for (let texture_attrib of ATTRIB_MAPPING_KEYS) {
			const param_name = ATTRIB_MAPPING[texture_attrib];
			const param_value = this.params.float(param_name);

			if (param_value != null && texture) {
				if (texture[texture_attrib] != param_value) {
					texture[texture_attrib] = param_value;
					texture.needsUpdate = true;
				}
			}
		}
	}
	//
	//
	// VIDEO
	//
	//
	static PARAM_CALLBACK_video_update_time(node: FileCopNode) {
		node.video_update_time();
	}
	static PARAM_CALLBACK_video_update_play(node: FileCopNode) {
		node.video_update_play();
	}
	static PARAM_CALLBACK_video_update_muted(node: FileCopNode) {
		node.video_update_muted();
	}
	static PARAM_CALLBACK_video_update_loop(node: FileCopNode) {
		node.video_update_loop();
	}
	private async video_update_time() {
		if (this._video) {
			const param = this.p.video_time;
			if (param.is_dirty) {
				await param.compute();
			}
			this._video.currentTime = param.value;
		}
	}
	private video_update_muted() {
		if (this._video) {
			this._video.muted = this.pv.muted;
		}
	}
	private video_update_loop() {
		if (this._video) {
			this._video.loop = this.pv.loop;
		}
	}

	private video_update_play() {
		if (this._video) {
			if (this.pv.play) {
				this._video.play();
			} else {
				this._video.pause();
			}
		}
	}
	//
	//
	// UTILS
	//
	//
	static PARAM_CALLBACK_reload(node: FileCopNode, param: BaseParamType) {
		node.param_callback_reload();
	}
	private param_callback_reload() {
		// set the param dirty is preferable, in case this is used to refresh a local asset
		this.p.url.set_successors_dirty();
		// this.set_dirty()
	}

	private async _load_texture(url: string) {
		let texture: Texture | VideoTexture | null = null;
		const param = this.p.url;
		this._texture_loader = this._texture_loader || new CoreTextureLoader(this, param);
		try {
			texture = await this._texture_loader.load_texture_from_url_or_op(url);
		} catch (e) {}
		if (!texture) {
			this.states.error.set(`could not load texture '${url}'`);
		}
		return texture;
	}
}
