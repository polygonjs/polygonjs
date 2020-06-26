import {VideoTexture} from 'three/src/textures/VideoTexture';
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
import {Texture} from 'three/src/textures/Texture';

import {TypedCopNode} from './_Base';
import {CoreTextureLoader} from '../../../core/loader/Texture';

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
// 	'AlphaFormat',
// 	'RGBFormat',
// 	'RGBAFormat',
// 	'LuminanceFormat',
// 	'LuminanceAlphaFormat',
// 	'RGBEFormat',
// 	'DepthFormat',
// 	'DepthStencilFormat',
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

// interface AttribMapping {
// 	encoding: string;
// 	mapping: string;
// 	wrapS: string;
// 	wrapT: string;
// 	minFilter: string;
// 	magFilter: string;
// }
// const ATTRIB_MAPPING_KEYS: Array<keyof AttribMapping> = [
// 	'encoding',
// 	'mapping',
// 	'wrapS',
// 	'wrapT',
// 	'minFilter',
// 	'magFilter',
// ];
// const ATTRIB_MAPPING: AttribMapping = {
// 	encoding: 'encoding',
// 	mapping: 'mapping',
// 	wrapS: 'wrap_s',
// 	wrapT: 'wrap_t',
// 	minFilter: 'min_filter',
// 	magFilter: 'mag_filter',

// 	// type: 'type',
// 	// encoding: 'encoding'
// 	// format: 'format',
// };

interface TextureWithUpdateMatrix extends Texture {
	updateMatrix(): void;
}

import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {DesktopFileType} from '../../params/utils/OptionsController';
// import {DataTextureController, DataTextureControllerBufferType} from './utils/DataTextureController';
class FileCopParamsConfig extends NodeParamsConfig {
	//
	url = ParamConfig.STRING(CoreTextureLoader.PARAM_DEFAULT, {
		desktop_browse: {file_type: DesktopFileType.TEXTURE},
		asset_reference: true,
	});
	reload = ParamConfig.BUTTON(null, {
		callback: (node: BaseNodeType, param: BaseParamType) => {
			FileCopNode.PARAM_CALLBACK_reload(node as FileCopNode, param);
		},
	});
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
	tminfilter = ParamConfig.BOOLEAN(0);
	min_filter = ParamConfig.INTEGER(Object.values(MIN_FILTERS[5])[0], {
		visible_if: {tminfilter: 1},
		menu: {
			entries: MIN_FILTERS.map((m) => {
				return {
					name: Object.keys(m)[0],
					value: Object.values(m)[0] as number,
				};
			}),
		},
	});
	tmagfilter = ParamConfig.BOOLEAN(0);
	mag_filter = ParamConfig.INTEGER(Object.values(MAG_FILTERS[0])[0], {
		visible_if: {tmagfilter: 1},
		menu: {
			entries: MAG_FILTERS.map((m) => {
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
	// use_data_texture = ParamConfig.BOOLEAN(0, {
	// 	visible_if: {is_video: 0},
	// });
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
	static type() {
		return 'file';
	}
	required_modules() {
		const ext = CoreTextureLoader.get_extension(this.pv.url || '');
		return CoreTextureLoader.module_names(ext);
	}

	private _video: HTMLVideoElement | undefined;
	// private _data_texture_controller: DataTextureController | undefined;
	private _texture_loader: CoreTextureLoader | undefined;

	static readonly VIDEO_TIME_PARAM_NAME = 'video_time';
	static readonly DEFAULT_NODE_PATH = {
		UV: '/COP/file_uv',
		ENV_MAP: '/COP/env_map',
	};
	static readonly VIDEO_EXTENSIONS = ['mp4', 'ogv'];

	initialize_node() {
		this.scene.dispatch_controller.on_add_listener(() => {
			this.params.on_params_created('params_label', () => {
				this.params.label.init([this.p.url], () => {
					const url = this.pv.url;
					if (url) {
						const elements = url.split('/');
						return elements[elements.length - 1];
					} else {
						return '';
					}
				});
			});
		});
	}
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
			// if (this.pv.use_data_texture) {
			// 	this._data_texture_controller =
			// 		this._data_texture_controller ||
			// 		new DataTextureController(DataTextureControllerBufferType.Uint8ClampedArray);
			// 	const data_texture = this._data_texture_controller.from_texture(texture);
			// 	this._update_texture_params(data_texture);
			// 	this.set_texture(data_texture);
			// } else {
			this.set_texture(texture);
			// }
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
		if (this.pv.tencoding) {
			texture.encoding = this.pv.encoding;
		}
		if (this.pv.tmapping) {
			texture.mapping = this.pv.mapping;
		}
		if (this.pv.twrap) {
			texture.wrapS = this.pv.wrap_s;
			texture.wrapT = this.pv.wrap_t;
		}
		if (this.pv.tminfilter) {
			texture.minFilter = this.pv.min_filter;
		}
		if (this.pv.tminfilter) {
			texture.magFilter = this.pv.mag_filter;
		}

		if (this.pv.tanisotropy) {
			texture.anisotropy = this.pv.anisotropy;
		}
		if (this.pv.tflip_y) {
			texture.flipY = this.pv.flip_y;
		}
		this._update_texture_transform(texture);
	}
	private _update_texture_transform(texture: Texture) {
		if (!this.pv.ttransform) {
			return;
		}
		texture.offset.copy(this.pv.offset);
		texture.repeat.copy(this.pv.repeat);
		texture.rotation = this.pv.rotation;
		texture.center.copy(this.pv.center);

		(texture as TextureWithUpdateMatrix).updateMatrix();
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
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		// this.p.url.set_successors_dirty();
		this.p.url.set_dirty();
	}

	private async _load_texture(url: string) {
		let texture: Texture | VideoTexture | null = null;
		const param = this.p.url;
		this._texture_loader = this._texture_loader || new CoreTextureLoader(this, param);
		try {
			texture = await this._texture_loader.load_texture_from_url_or_op(url);
			if (texture) {
				texture.matrixAutoUpdate = false;
			}
		} catch (e) {}
		if (!texture) {
			this.states.error.set(`could not load texture '${url}'`);
		}
		return texture;
	}
}
