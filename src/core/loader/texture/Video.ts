import {VideoTexture, LoadingManager, Loader} from 'three';
// import {BaseNodeType} from '../../../engine/nodes/_Base';
import {CoreLoaderTexture} from '../Texture';
import {CoreBaseLoader} from './../_Base';
// import {BaseTextureLoader,} from './_BaseTextureLoader';
// import {TextureLoadOptions} from './_BaseImageLoader';
import {Poly} from '../../../engine/Poly';
interface VideoSourceTypeByExt {
	ogg: string;
	ogv: string;
	mp4: string;
}
const VIDEO_SOURCE_TYPE_BY_EXT: VideoSourceTypeByExt = {
	ogg: 'video/ogg; codecs="theora, vorbis"',
	ogv: 'video/ogg; codecs="theora, vorbis"',
	mp4: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
};

type OnLoad = (texture: VideoTexture) => void;
type OnProgress = (progress: number) => void;
type OnError = (error: Error) => void;
class VideoTextureLoader extends Loader<VideoTexture> {
	constructor(manager: LoadingManager, protected originalUrls: string[]) {
		super(manager);
	}
	loadMultipleUrls(urls: string[], onLoad: OnLoad, onProgress?: OnProgress, onError?: OnError) {
		const video = document.createElement('video');
		video.setAttribute('crossOrigin', 'anonymous');
		video.setAttribute('playinline', `${true}`);
		video.setAttribute('muted', `${true}`);
		video.setAttribute('autoplay', `${true}`); // to ensure it loads
		video.style.display = 'none';

		// DO NOT WAIT FOR onloadedmetadata event
		// to create the VideoTexture
		// as this breaks loading
		// when using a texture that has both mp4 and ogv
		const texture = new VideoTexture(video);
		video.onloadedmetadata = () => {
			// video.pause();
			// const texture = new VideoTexture(video);
			// video.setAttribute('controls', true)
			// video.style="display:none"
			onLoad(texture);
		};
		video.onprogress = (ev) => {
			if (onProgress) {
				onProgress(ev.loaded / ev.total);
			}
		};
		video.onerror = (error) => {
			if (onError) {
				onError(new Error('failed to load video'));
			}
		};

		const urlsCount = urls.length;
		for (let i = 0; i < urlsCount; i++) {
			const blobUrl = urls[i];
			const originalUrl = this.originalUrls[i];

			const ext = CoreBaseLoader.extension(originalUrl) as keyof VideoSourceTypeByExt;
			const type = VIDEO_SOURCE_TYPE_BY_EXT[ext] || `video/${ext}`;

			const source = document.createElement('source');
			source.src = blobUrl;
			source.type = type;
			video.append(source);
		}
	}
}
export class CoreVideoTextureLoader extends CoreBaseLoader<string[]> {
	async loadVideo(): Promise<VideoTexture> {
		const urls = this._urlToLoad();
		return new Promise(async (resolve, reject) => {
			const loader = await this._getLoader();

			urls.forEach((url) => CoreLoaderTexture.incrementInProgressLoadsCount());
			await CoreLoaderTexture.waitForMaxConcurrentLoadsQueueFreed();
			loader.loadMultipleUrls(
				urls,
				(texture: VideoTexture) => {
					urls.forEach((url, i) => {
						const isLast = i == urls.length - 1;
						CoreLoaderTexture.decrementInProgressLoadsCount(url, isLast ? texture : undefined);
					});

					resolve(texture);
				},
				undefined,
				(error: any) => {
					urls.forEach((url) => CoreLoaderTexture.decrementInProgressLoadsCount(url));
					Poly.warn('error', error);
					reject();
				}
			);
		});
	}

	protected async _getLoader() {
		const loader = new VideoTextureLoader(this.loadingManager, this._url);
		return loader;
	}

	// constructor(protected override _url: string, protected override _node: BaseNodeType) {
	// 	super(_url, _node);
	// }

	// loadVideo(): Promise<VideoTexture> {
	// 	// if (1 + 1) {
	// 	// 	return this._loadVideoFull();
	// 	// } else {
	// 	return this._loadVideoDefault();
	// 	// }
	// }
	// // private _loadVideoFull(): Promise<VideoTexture> {
	// // 	return new Promise(async (resolve) => {
	// // 		const url = await this._urlToLoad();
	// // 		console.log(url);
	// // 		fetch(url, {mode: 'no-cors'}).then(async (response) => {
	// // 			console.log({response});
	// // 			const blob = await response.blob();
	// // 			console.log({blob});
	// // 			const source = URL.createObjectURL(blob);
	// // 			console.log(source);
	// // 			const video = document.createElement('video');
	// // 			video.src = source;

	// // 			const texture = new VideoTexture(video);
	// // 			//    document.body.append(video)
	// // 			resolve(texture);
	// // 		});
	// // 	});
	// // }
	// private _loadVideoDefault(): Promise<VideoTexture> {
	// 	return new Promise(async (resolve, reject) => {
	// 		const url = await this._urlToLoad();
	// 		CoreLoaderTexture.incrementInProgressLoadsCount();
	// 		await CoreLoaderTexture.waitForMaxConcurrentLoadsQueueFreed();

	// 		const video = document.createElement('video');
	// 		video.setAttribute('crossOrigin', 'anonymous');
	// 		video.setAttribute('autoplay', `${true}`); // to ensure it loads
	// 		video.setAttribute('loop', `${true}`);
	// 		// wait for onloadedmetadata to ensure that we have a duration
	// 		// video.onloadeddata = function (e) {
	// 		// 	console.log('onloadeddata', e);
	// 		// };
	// 		video.onloadedmetadata = function () {
	// 			video.pause();
	// 			const texture = new VideoTexture(video);
	// 			// video.setAttribute('controls', true)
	// 			// video.style="display:none"
	// 			CoreLoaderTexture.decrementInProgressLoadsCount(url, texture);
	// 			resolve(texture);
	// 		};

	// 		// add source as is
	// 		const originalSource = document.createElement('source');
	// 		const originalExt = CoreBaseLoader.extension(url) as keyof VideoSourceTypeByExt;
	// 		let type: string = VideoTextureLoader.VIDEO_SOURCE_TYPE_BY_EXT[originalExt];
	// 		type = type || VideoTextureLoader._default_video_source_type(url);
	// 		originalSource.setAttribute('type', type);
	// 		originalSource.setAttribute('src', url);
	// 		video.appendChild(originalSource);

	// 		// add secondary source, either mp4 or ogv depending on the first url
	// 		let secondaryUrl: string | undefined;
	// 		if (originalExt == 'mp4') {
	// 			// add ogv
	// 			secondaryUrl = CoreLoaderTexture.replaceExtension(url, 'ogv');
	// 		} else {
	// 			// add mp4
	// 			secondaryUrl = CoreLoaderTexture.replaceExtension(url, 'mp4');
	// 		}
	// 		const secondary_source = document.createElement('source');
	// 		const secondary_ext = CoreBaseLoader.extension(secondaryUrl) as keyof VideoSourceTypeByExt;
	// 		type = VideoTextureLoader.VIDEO_SOURCE_TYPE_BY_EXT[secondary_ext];
	// 		type = type || VideoTextureLoader._default_video_source_type(url);
	// 		secondary_source.setAttribute('type', type);
	// 		secondary_source.setAttribute('src', url);
	// 		video.appendChild(secondary_source);
	// 	});
	// }

	// static _default_video_source_type(url: string) {
	// 	const ext = CoreBaseLoader.extension(url);
	// 	return `video/${ext}`;
	// }
}
