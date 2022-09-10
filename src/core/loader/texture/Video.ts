import {VideoTexture} from 'three';
import {BaseNodeType} from '../../../engine/nodes/_Base';
import {CoreLoaderTexture} from '../Texture';
import {CoreBaseLoader} from './../_Base';
import {BaseTextureLoader} from './_BaseTextureLoader';
interface VideoSourceTypeByExt {
	ogg: string;
	ogv: string;
	mp4: string;
}

export class VideoTextureLoader extends BaseTextureLoader {
	static VIDEO_SOURCE_TYPE_BY_EXT: VideoSourceTypeByExt = {
		ogg: 'video/ogg; codecs="theora, vorbis"',
		ogv: 'video/ogg; codecs="theora, vorbis"',
		mp4: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
	};

	constructor(protected override _url: string, protected override _node: BaseNodeType) {
		super(_url, _node);
	}

	loadVideo(): Promise<VideoTexture> {
		// if (1 + 1) {
		// 	return this._loadVideoFull();
		// } else {
		return this._loadVideoDefault();
		// }
	}
	// private _loadVideoFull(): Promise<VideoTexture> {
	// 	return new Promise(async (resolve) => {
	// 		const url = await this._urlToLoad();
	// 		console.log(url);
	// 		fetch(url, {mode: 'no-cors'}).then(async (response) => {
	// 			console.log({response});
	// 			const blob = await response.blob();
	// 			console.log({blob});
	// 			const source = URL.createObjectURL(blob);
	// 			console.log(source);
	// 			const video = document.createElement('video');
	// 			video.src = source;

	// 			const texture = new VideoTexture(video);
	// 			//    document.body.append(video)
	// 			resolve(texture);
	// 		});
	// 	});
	// }
	private _loadVideoDefault(): Promise<VideoTexture> {
		return new Promise(async (resolve, reject) => {
			const url = await this._urlToLoad();
			CoreLoaderTexture.incrementInProgressLoadsCount();
			await CoreLoaderTexture.waitForMaxConcurrentLoadsQueueFreed();

			const video = document.createElement('video');
			video.setAttribute('crossOrigin', 'anonymous');
			video.setAttribute('autoplay', `${true}`); // to ensure it loads
			video.setAttribute('loop', `${true}`);
			// wait for onloadedmetadata to ensure that we have a duration
			// video.onloadeddata = function (e) {
			// 	console.log('onloadeddata', e);
			// };
			video.onloadedmetadata = function () {
				video.pause();
				const texture = new VideoTexture(video);
				// video.setAttribute('controls', true)
				// video.style="display:none"
				CoreLoaderTexture.decrementInProgressLoadsCount(url, texture);
				resolve(texture);
			};

			// add source as is
			const originalSource = document.createElement('source');
			const originalExt = CoreBaseLoader.extension(url) as keyof VideoSourceTypeByExt;
			let type: string = VideoTextureLoader.VIDEO_SOURCE_TYPE_BY_EXT[originalExt];
			type = type || VideoTextureLoader._default_video_source_type(url);
			originalSource.setAttribute('type', type);
			originalSource.setAttribute('src', url);
			video.appendChild(originalSource);

			// add secondary source, either mp4 or ogv depending on the first url
			let secondaryUrl: string | undefined;
			if (originalExt == 'mp4') {
				// add ogv
				secondaryUrl = CoreLoaderTexture.replaceExtension(url, 'ogv');
			} else {
				// add mp4
				secondaryUrl = CoreLoaderTexture.replaceExtension(url, 'mp4');
			}
			const secondary_source = document.createElement('source');
			const secondary_ext = CoreBaseLoader.extension(secondaryUrl) as keyof VideoSourceTypeByExt;
			type = VideoTextureLoader.VIDEO_SOURCE_TYPE_BY_EXT[secondary_ext];
			type = type || VideoTextureLoader._default_video_source_type(url);
			secondary_source.setAttribute('type', type);
			secondary_source.setAttribute('src', url);
			video.appendChild(secondary_source);
		});
	}

	static _default_video_source_type(url: string) {
		const ext = CoreBaseLoader.extension(url);
		return `video/${ext}`;
	}
}
