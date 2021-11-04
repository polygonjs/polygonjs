import {VideoTexture} from 'three/src/textures/VideoTexture';
import {TextureLoader} from 'three/src/loaders/TextureLoader';
import {Texture} from 'three/src/textures/Texture';
import {CoreWalker} from '../Walker';
import {BaseNodeType} from '../../engine/nodes/_Base';
import {BaseParamType} from '../../engine/params/_Base';
import {BaseCopNodeClass} from '../../engine/nodes/cop/_Base';
import {TextureContainer} from '../../engine/containers/Texture';
import {Poly} from '../../engine/Poly';
import {ModuleName} from '../../engine/poly/registers/modules/Common';
import {CoreUserAgent} from '../UserAgent';
import {ASSETS_ROOT} from './AssetsUtils';
import {PolyScene} from '../../engine/scene/PolyScene';
import {CoreBaseLoader} from './_Base';
import {VIDEO_EXTENSIONS, ImageExtension} from '../FileTypeController';
interface VideoSourceTypeByExt {
	ogg: string;
	ogv: string;
	mp4: string;
}
// interface ImageScriptUrlByExt {
// 	exr: string;
// 	basis: string;
// }
interface ThreeLoaderByExt {
	exr: string;
	basis: string;
	hdr: string;
}

interface TextureLoadOptions {
	tdataType: boolean;
	dataType: number;
}
type MaxConcurrentLoadsCountMethod = () => number;
type OnTextureLoadedCallback = (url: string, texture: Texture) => void;

interface CoreLoaderTextureOptions {
	forceVideo?: boolean;
}

export class CoreLoaderTexture extends CoreBaseLoader {
	static PARAM_DEFAULT = `${ASSETS_ROOT}/textures/uv.jpg`;
	static PARAM_ENV_DEFAULT = `${ASSETS_ROOT}/textures/piz_compressed.exr`;

	static VIDEO_SOURCE_TYPE_BY_EXT: VideoSourceTypeByExt = {
		ogg: 'video/ogg; codecs="theora, vorbis"',
		ogv: 'video/ogg; codecs="theora, vorbis"',
		mp4: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
	};
	private _forceVideo: boolean = false;

	constructor(
		_url: string,
		private _param: BaseParamType,
		protected _node: BaseNodeType,
		protected _scene: PolyScene,
		options?: CoreLoaderTextureOptions
	) {
		super(_url, _scene, _node);
		this._forceVideo = options?.forceVideo || this._forceVideo;
	}

	static _onTextureLoadedCallback: OnTextureLoadedCallback | undefined;
	static onTextureLoaded(callback: OnTextureLoadedCallback | undefined) {
		this._onTextureLoadedCallback = callback;
	}

	async load_texture_from_url_or_op(options: TextureLoadOptions): Promise<Texture | VideoTexture | null> {
		let texture: Texture | null = null;
		let foundNode: BaseNodeType | null = null;

		if (this._url.substring(0, 3) == 'op:') {
			const node_path = this._url.substring(3);
			foundNode = CoreWalker.findNode(this._node, node_path);
			if (foundNode) {
				if (foundNode instanceof BaseCopNodeClass) {
					const container: TextureContainer = await foundNode.compute();
					texture = container.texture();
				} else {
					this._node.states.error.set(`found node is not a texture node`);
				}

				// this._assign_texture(attrib, texture)
			} else {
				this._node.states.error.set(`no node found in path '${node_path}'`);
			}
		} else {
			texture = await this._loadUrl(options);
			if (texture) {
			} else {
				this._node.states.error.set(`could not load texture ${this._url}`);
			}
		}

		// NOTE: if this._param gets its value from an expression like `ch('/CONTROL/photoUrl')`
		// then found_node will be null, so the graph should not be changed
		if (foundNode && this._param.graphPredecessors()[0] != foundNode) {
			this._param.graphDisconnectPredecessors();
			this._param.addGraphInput(foundNode);
		}

		// this._assign_texture(attrib, texture)
		return texture;
	}

	private async _loadUrl(options: TextureLoadOptions): Promise<Texture> {
		return new Promise(async (resolve, reject) => {
			// let resolvedUrl = paramUrl;
			// const ext = CoreLoaderTexture.get_extension(resolvedUrl);
			// const blobUrl = Poly.blobs.blobUrl(resolvedUrl);
			// if (blobUrl) {
			// 	resolvedUrl = blobUrl;
			// } else {
			// 	if (resolvedUrl[0] != 'h') {
			// 		const assets_root = this._node.scene().assets.root();
			// 		if (assets_root) {
			// 			resolvedUrl = `${assets_root}${resolvedUrl}`;
			// 		}
			// 	}
			// }
			const ext = this.extension();
			const url = await this._urlToLoad();

			if (this._forceVideo || VIDEO_EXTENSIONS.includes(ext)) {
				const texture: VideoTexture = await this._loadVideo(url);
				resolve(texture);
			} else {
				try {
					const texture: Texture = await this._loadImage(url, options);
					resolve(texture);
				} catch (e) {
					reject();
				}
			}
		});
	}

	private _loadImage(url: string, options: TextureLoadOptions): Promise<Texture> {
		return new Promise(async (resolve, reject) => {
			const ext = this.extension();
			this.loader_for_ext(ext, options).then(async (loader) => {
				if (loader) {
					CoreLoaderTexture.incrementInProgressLoadsCount();
					await CoreLoaderTexture.waitForMaxConcurrentLoadsQueueFreed();
					loader.load(
						url,
						(texture: Texture) => {
							CoreLoaderTexture.decrementInProgressLoadsCount();

							const callback = CoreLoaderTexture._onTextureLoadedCallback;
							if (callback) {
								callback(url, texture);
							}

							resolve(texture);
						},
						undefined,
						(error: any) => {
							CoreLoaderTexture.decrementInProgressLoadsCount();
							Poly.warn('error', error);
							reject();
						}
					);
				} else {
					reject();
				}
			});
		});
	}
	private _loadVideo(url: string): Promise<VideoTexture> {
		return new Promise(async (resolve, reject) => {
			CoreLoaderTexture.incrementInProgressLoadsCount();
			await CoreLoaderTexture.waitForMaxConcurrentLoadsQueueFreed();

			const video = document.createElement('video');
			video.setAttribute('crossOrigin', 'anonymous');
			video.setAttribute('autoplay', `${true}`); // to ensure it loads
			video.setAttribute('loop', `${true}`);
			// wait for onloadedmetadata to ensure that we have a duration
			video.onloadedmetadata = function () {
				video.pause();
				const texture = new VideoTexture(video);
				// video.setAttribute('controls', true)
				// video.style="display:none"
				CoreLoaderTexture.decrementInProgressLoadsCount();
				const callback = CoreLoaderTexture._onTextureLoadedCallback;
				if (callback) {
					callback(url, texture);
				}
				resolve(texture);
			};

			// add source as is
			const original_source = document.createElement('source');
			const original_ext = CoreBaseLoader.extension(url) as keyof VideoSourceTypeByExt;
			let type: string = CoreLoaderTexture.VIDEO_SOURCE_TYPE_BY_EXT[original_ext];
			type = type || CoreLoaderTexture._default_video_source_type(url);
			original_source.setAttribute('type', type);
			original_source.setAttribute('src', url);
			video.appendChild(original_source);

			// add secondary source, either mp4 or ogv depending on the first url
			let secondary_url = url;
			if (original_ext == 'mp4') {
				// add ogv
				secondary_url = CoreLoaderTexture.replaceExtension(url, 'ogv');
			} else {
				// add mp4
				secondary_url = CoreLoaderTexture.replaceExtension(url, 'mp4');
			}
			const secondary_source = document.createElement('source');
			const secondary_ext = CoreBaseLoader.extension(secondary_url) as keyof VideoSourceTypeByExt;
			type = CoreLoaderTexture.VIDEO_SOURCE_TYPE_BY_EXT[secondary_ext];
			type = type || CoreLoaderTexture._default_video_source_type(url);
			secondary_source.setAttribute('type', type);
			secondary_source.setAttribute('src', url);
			video.appendChild(secondary_source);
		});
	}

	static module_names(ext: string): ModuleName[] | void {
		switch (ext) {
			case ImageExtension.EXR:
				return [ModuleName.EXRLoader];
			case ImageExtension.HDR:
				return [ModuleName.RGBELoader];
			case ImageExtension.BASIS:
				return [ModuleName.BasisTextureLoader];
		}
	}

	async loader_for_ext(ext: string, options: TextureLoadOptions) {
		const ext_lowercase = ext.toLowerCase() as keyof ThreeLoaderByExt;
		switch (ext_lowercase) {
			case ImageExtension.EXR: {
				return await this._exr_loader(options);
			}
			case ImageExtension.HDR: {
				return await this._hdr_loader(options);
			}
			case ImageExtension.BASIS: {
				return await CoreLoaderTexture._basis_loader(this._node);
			}
		}
		return new TextureLoader(this.loadingManager);
	}

	private async _exr_loader(options: TextureLoadOptions) {
		const EXRLoader = await Poly.modulesRegister.module(ModuleName.EXRLoader);
		if (EXRLoader) {
			const loader = new EXRLoader(this.loadingManager);
			if (options.tdataType) {
				loader.setDataType(options.dataType);
			}
			return loader;
		}
	}
	private async _hdr_loader(options: TextureLoadOptions) {
		const RGBELoader = await Poly.modulesRegister.module(ModuleName.RGBELoader);
		if (RGBELoader) {
			const loader = new RGBELoader(this.loadingManager);
			if (options.tdataType) {
				loader.setDataType(options.dataType);
			}
			return loader;
		}
	}
	private static async _basis_loader(node: BaseNodeType) {
		const BasisTextureLoader = await Poly.modulesRegister.module(ModuleName.BasisTextureLoader);
		if (BasisTextureLoader) {
			const BASISLoader = new BasisTextureLoader(this.loadingManager);
			const root = Poly.libs.root();
			const BASISPath = Poly.libs.BASISPath();
			if (root || BASISPath) {
				const decoder_path = `${root || ''}${BASISPath || ''}/`;

				if (node) {
					const files = ['basis_transcoder.js', 'basis_transcoder.wasm'];
					await this._loadMultipleBlobGlobal({
						files: files.map((file) => {
							return {
								storedUrl: `${BASISPath}/${file}`,
								fullUrl: `${decoder_path}${file}`,
							};
						}),
						node,
						error: 'failed to load basis libraries. Make sure to install them to load .basis files',
					});
				}

				BASISLoader.setTranscoderPath(decoder_path);
			} else {
				(BASISLoader as any).setTranscoderPath(undefined);
			}
			const renderer = await Poly.renderersController.waitForRenderer();
			if (renderer) {
				BASISLoader.detectSupport(renderer);
			} else {
				Poly.warn('texture loader found no renderer for basis texture loader');
			}
			return BASISLoader;
		}
	}

	static _default_video_source_type(url: string) {
		const ext = CoreBaseLoader.extension(url);
		return `video/${ext}`;
	}

	static pixel_data(texture: Texture) {
		const img = texture.image;
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const context = canvas.getContext('2d');
		if (context) {
			context.drawImage(img, 0, 0, img.width, img.height);
			return context.getImageData(0, 0, img.width, img.height);
		}
	}

	// TODO: typescript: check what type the pixel_data is
	// static pixel_data_to_attribute(pixel_data: Pixel, geometry: BufferGeometry, attrib_name_with_component:string, convert_method: (x:number, y:number, z:number, w:number)=>number) {
	// 	const {data} = pixel_data;
	// 	const core_geometry = new CoreGeometry(geometry);
	// 	// TODO: add error if no uvs
	// 	const values = [];
	// 	const points = core_geometry.points();
	// 	for (let point of points) {
	// 		const uv = point.attribValue('uv');
	// 		const x = Math.floor((pixel_data.width - 1) * uv.x);
	// 		const y = Math.floor((pixel_data.height - 1) * (1 - uv.y));
	// 		const i = y * pixel_data.width + x;
	// 		// const val = data[4*i] / 255.0;
	// 		if (convert_method) {
	// 			const val = convert_method(data[4 * i + 0], data[4 * i + 1], data[4 * i + 2], data[4 * i + 3]);
	// 			values.push(val);
	// 		} else {
	// 			values.push([data[4 * i + 0], data[4 * i + 1], data[4 * i + 2]]);
	// 		}
	// 	}

	// 	const attrib_name_elements = attrib_name_with_component.split('.');
	// 	let attrib_name = attrib_name_elements[0];
	// 	let component_offset = null;
	// 	if (attrib_name_elements.length > 1) {
	// 		const component = attrib_name_elements[1] as keyof Vector4Like
	// 		component_offset = {x: 0, y: 1, z: 2, w: 3}[component];
	// 	}

	// 	let attrib = geometry.attributes[attrib_name];
	// 	if (attrib) {
	// 		const array = attrib.array;
	// 		let index = 0;
	// 		let is_array = null;
	// 		for (let value of values) {
	// 			if (is_array || CoreType.isArray(value)) {
	// 				is_array = true;
	// 				let component_index = 0;
	// 				for (let value_c of value) {
	// 					array[attrib.itemSize * index + component_index] = value_c;
	// 					component_index++;
	// 				}
	// 			} else {
	// 				array[attrib.itemSize * index + component_offset] = value;
	// 			}
	// 			index++;
	// 		}
	// 	} else {
	// 		attrib = geometry.setAttribute(attrib_name, new Float32BufferAttribute(values, 1));
	// 	}
	// 	attrib.needsUpdate = true;
	// }

	static replaceExtension(url: string, new_extension: string) {
		const elements = url.split('?');
		const url_without_params = elements[0];
		const url_elements = url_without_params.split('.');
		url_elements.pop();
		url_elements.push(new_extension);
		return [url_elements.join('.'), elements[1]].join('?');
	}

	//
	//
	// CONCURRENT LOADS
	//
	//
	private static MAX_CONCURRENT_LOADS_COUNT: number = CoreLoaderTexture._init_max_concurrent_loads_count();
	private static CONCURRENT_LOADS_DELAY: number = CoreLoaderTexture._init_concurrent_loads_delay();
	private static in_progress_loads_count: number = 0;
	private static _queue: Array<() => void> = [];
	private static _maxConcurrentLoadsCountMethod: MaxConcurrentLoadsCountMethod | undefined;
	public static setMaxConcurrentLoadsCount(method: MaxConcurrentLoadsCountMethod | undefined) {
		this._maxConcurrentLoadsCountMethod = method;
	}
	private static _init_max_concurrent_loads_count(): number {
		if (this._maxConcurrentLoadsCountMethod) {
			return this._maxConcurrentLoadsCountMethod();
		}
		return CoreUserAgent.isChrome() ? 10 : 4;
		// const parser = new UAParser();
		// const name = parser.getBrowser().name;
		// // limit to 4 for non chrome,
		// // as firefox was seen hanging trying to load multiple glb files
		// // limit to 1 for safari,
		// if (name) {
		// 	const loads_count_by_browser: PolyDictionary<number> = {
		// 		Chrome: 10,
		// 		Firefox: 4,
		// 	};
		// 	const loads_count = loads_count_by_browser[name];
		// 	if (loads_count != null) {
		// 		return loads_count;
		// 	}
		// }
		// return 1;
	}
	private static _init_concurrent_loads_delay(): number {
		return CoreUserAgent.isChrome() ? 0 : 10;
		// const parser = new UAParser();
		// const name = parser.getBrowser().name;
		// // add a delay for browsers other than Chrome and Firefox
		// if (name) {
		// 	const delay_by_browser: PolyDictionary<number> = {
		// 		Chrome: 0,
		// 		Firefox: 10,
		// 	};
		// 	const delay = delay_by_browser[name];
		// 	if (delay != null) {
		// 		return delay;
		// 	}
		// }
		// return 100;
	}
	// public static override_max_concurrent_loads_count(count: number) {
	// 	this.MAX_CONCURRENT_LOADS_COUNT = count;
	// }

	static incrementInProgressLoadsCount() {
		this.in_progress_loads_count++;
	}
	static decrementInProgressLoadsCount() {
		this.in_progress_loads_count--;

		const queued_resolve = this._queue.pop();
		if (queued_resolve) {
			const delay = this.CONCURRENT_LOADS_DELAY;
			setTimeout(() => {
				queued_resolve();
			}, delay);
		}
	}

	static async waitForMaxConcurrentLoadsQueueFreed(): Promise<void> {
		if (this.in_progress_loads_count <= this.MAX_CONCURRENT_LOADS_COUNT) {
			return;
		} else {
			return new Promise((resolve) => {
				this._queue.push(resolve);
			});
		}
	}
}
