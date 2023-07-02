/**
 * Imports a video
 *
 * @remarks
 * TIP: to ensure that your video starts as soon as possible, make sure to pre-process it with a tool like qt-faststart. There are many places where you can find it, but here are some suggestions:
 *
 * - download it from [https://pypi.org/project/qtfaststart/](https://pypi.org/project/qtfaststart/)
 * - download it from [https://manpages.debian.org/stretch/ffmpeg/qt-faststart.1.en.html](https://manpages.debian.org/stretch/ffmpeg/qt-faststart.1.en.html)
 * - with ffmpeg, you can use the following command line: `ffmpeg -i in.mp4 -c copy -map 0 -movflags +faststart out.mp4
`

In a future version of this node, it will also be possible to link it to a video tag that could already be in your html DOM. This way, you could sets multiple source tags (one with mp4 and one with ogv) instead of a single url.

 */
import {ParamEvent} from './../../poly/ParamEvent';
import {Constructor} from '../../../types/GlobalTypes';
import {VideoTexture} from 'three';
import {Texture} from 'three';
import {TypedCopNode} from './_Base';

import {BaseNodeType} from '../_Base';
import {BaseParamType} from '../../params/_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {isUrlVideo} from '../../../core/FileTypeController';
import {TextureParamsController, TextureParamConfig} from './utils/TextureParamsController';
import {isBooleanTrue} from '../../../core/BooleanValue';
import {InputCloneMode} from '../../poly/InputCloneMode';
import {CopType} from '../../poly/registers/nodes/types/Cop';
import {FileTypeCheckCopParamConfig} from './utils/CheckFileType';
import {Poly} from '../../Poly';
import {CoreVideoTextureLoader} from '../../../core/loader/texture/Video';
import {VideoEvent, VIDEO_EVENTS} from '../../../core/VideoEvent';
import {EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT} from '../../../core/loader/FileExtensionRegister';
import {CoreDomUtils} from '../../../core/DomUtils';
import {NodeContext} from '../../poly/NodeContext';
// import {TypeAssert} from '../../poly/Assert'
import {StringParam} from '../../params/String';

export enum VideoMode {
	FROM_URLS = 'From Urls',
	FROM_HTML_ELEMENT = 'From HTML Element',
}
const VIDEO_MODES: VideoMode[] = [VideoMode.FROM_URLS, VideoMode.FROM_HTML_ELEMENT];
const VIDEO_MODE_ENTRIES = VIDEO_MODES.map((name, value) => ({name, value}));
const VIDEO_MODE_FROM_URLS = VIDEO_MODES.indexOf(VideoMode.FROM_URLS);
const VIDEO_MODE_FROM_HTML_ELEMENT = VIDEO_MODES.indexOf(VideoMode.FROM_HTML_ELEMENT);

function VideoCopParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		/** @param mode */
		mode = ParamConfig.INTEGER(VIDEO_MODE_FROM_URLS, {
			menu: {
				entries: VIDEO_MODE_ENTRIES,
			},
		});
		/** @param number of video files to fetch */
		urlsCount = ParamConfig.INTEGER(2, {
			range: [1, 3],
			rangeLocked: [true, true],
			visibleIf: {
				mode: VIDEO_MODE_FROM_URLS,
			},
		});
		/** @param url to fetch the video from */
		url1 = ParamConfig.STRING('', {
			fileBrowse: {extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.COP][CopType.VIDEO]},
		});
		/** @param url to fetch the video from */
		url2 = ParamConfig.STRING('', {
			fileBrowse: {extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.COP][CopType.VIDEO]},
			visibleIf: [
				{mode: VIDEO_MODE_FROM_URLS, urlsCount: 2},
				{mode: VIDEO_MODE_FROM_URLS, urlsCount: 3},
			],
		});
		/** @param url to fetch the video from */
		url3 = ParamConfig.STRING('', {
			fileBrowse: {extensions: EXTENSIONS_BY_NODE_TYPE_BY_CONTEXT[NodeContext.COP][CopType.VIDEO]},
			visibleIf: {mode: VIDEO_MODE_FROM_URLS, urlsCount: 3},
		});
		/** @param selector */
		selector = ParamConfig.STRING('', {
			visibleIf: {mode: VIDEO_MODE_FROM_HTML_ELEMENT},
		});
		/** @param reload the video */
		reload = ParamConfig.BUTTON(null, {
			callback: (node: BaseNodeType, param: BaseParamType) => {
				VideoCopNode.PARAM_CALLBACK_reload(node as VideoCopNode, param);
			},
		});
		/** @param play the video */
		play = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_videoUpdatePlay(node as VideoCopNode);
			},
		});
		/** @param set the video muted attribute */
		muted = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_videoUpdateMuted(node as VideoCopNode);
			},
		});
		/** @param set the video loop attribute */
		loop = ParamConfig.BOOLEAN(1, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_videoUpdateLoop(node as VideoCopNode);
			},
		});
		/** @param set the video time */
		videoTime = ParamConfig.FLOAT(0, {
			cook: false,
			// do not use videoTime, as calling "this._video.currentTime =" every frame is really expensive
		});
		/** @param seek the video at the time specified in videoTime */
		setVideoTime = ParamConfig.BUTTON(null, {
			cook: false,
			callback: (node: BaseNodeType) => {
				VideoCopNode.PARAM_CALLBACK_videoUpdateTime(node as VideoCopNode);
			},
		});
	};
}

class VideoCopParamsConfig extends FileTypeCheckCopParamConfig(
	TextureParamConfig(VideoCopParamConfig(NodeParamsConfig))
) {}

const ParamsConfig = new VideoCopParamsConfig();

export class VideoCopNode extends TypedCopNode<VideoCopParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return CopType.VIDEO;
	}

	private _video: HTMLVideoElement | undefined;
	HTMLVideoElement() {
		return this._video;
	}
	// private _data_texture_controller: DataTextureController | undefined;
	public readonly textureParamsController: TextureParamsController = new TextureParamsController(this);

	override initializeNode() {
		this.io.inputs.setCount(0, 1);
		this.io.inputs.initInputsClonedState(InputCloneMode.NEVER);
	}

	override dispose(): void {
		super.dispose();
		this._disposeHTMLVideoElement();
		Poly.blobs.clearBlobsForNode(this);
	}
	private _disposeHTMLVideoElement() {
		if (this._video) {
			this._removeVideoEvents(this._video);
			this._video.parentElement?.removeChild(this._video);
		}
	}
	setMode(mode: VideoMode) {
		this.p.mode.set(VIDEO_MODES.indexOf(mode));
	}
	mode() {
		return VIDEO_MODES[this.pv.mode];
	}

	override async cook(input_contents: Texture[]) {
		const mode = this.mode();
		if (mode == VideoMode.FROM_URLS && isBooleanTrue(this.pv.checkFileType)) {
			const setUrlNotVideoError = (param: StringParam) => {
				this.states.error.set(`url from param ${param.name()} is not a video ('${param.value}')`);
			};
			if (!isUrlVideo(this.pv.url1)) {
				return setUrlNotVideoError(this.p.url1);
			}
			const urlsCount = this.pv.urlsCount;
			if (urlsCount >= 2) {
				if (!isUrlVideo(this.pv.url2)) {
					return setUrlNotVideoError(this.p.url2);
				}
			}
			if (urlsCount >= 3) {
				if (!isUrlVideo(this.pv.url3)) {
					return setUrlNotVideoError(this.p.url3);
				}
			}
		}

		const texture =
			mode == VideoMode.FROM_URLS ? await this._loadTexture() : await this._videoTextureFromSelector();
		if (texture) {
			this._disposeHTMLVideoElement();
			this._video = texture.image;
			if (this._video) {
				this._addVideoEvents(this._video);
				// document.body.appendChild(this._video);
			}
			const inputTexture = input_contents[0];
			if (inputTexture) {
				TextureParamsController.copyTextureAttributes(texture, inputTexture);
			}

			this.videoUpdateLoop();
			this.videoUpdateMuted();
			this.videoUpdatePlay();
			this.videoUpdateTime();
			await this.textureParamsController.update(texture);
			this.setTexture(texture);
		} else {
			this.cookController.endCook();
		}
	}
	private _videoBoundEvents: Record<VideoEvent, () => void> = {
		play: this._onVideoEventPlay.bind(this),
		pause: this._onVideoEventPause.bind(this),
		timeupdate: this._onVideoEventTimeUpdate.bind(this),
		volumechange: this._onVideoEventVolumeChange.bind(this),
	};
	private _addVideoEvents(video: HTMLVideoElement) {
		for (let eventName of VIDEO_EVENTS) {
			video.addEventListener(eventName, this._videoBoundEvents[eventName]);
		}
	}
	private _removeVideoEvents(video: HTMLVideoElement) {
		for (let eventName of VIDEO_EVENTS) {
			video.removeEventListener(eventName, this._videoBoundEvents[eventName]);
		}
	}
	private _onVideoEvent(eventName: VideoEvent) {
		this.dispatchEvent({type: eventName});
	}

	private _onVideoEventPlay() {
		this._onVideoEvent(VideoEvent.PLAY);
	}
	private _onVideoEventPause() {
		this._onVideoEvent(VideoEvent.PAUSE);
	}
	private _onVideoEventTimeUpdate() {
		this._onVideoEvent(VideoEvent.TIME_UPDATE);
	}
	private _onVideoEventVolumeChange() {
		this._onVideoEvent(VideoEvent.VOLUME_CHANGE);
	}
	videoStatePlaying() {
		return this._video ? !this._video.paused : false;
	}
	videoStateMuted() {
		return this._video ? this._video.muted : true;
	}
	videoDuration() {
		return this._video?.duration || 0;
	}
	videoCurrentTime() {
		return this._video?.currentTime || 0;
	}

	//
	//
	// VIDEO STATE
	//
	//
	//

	// time
	static PARAM_CALLBACK_videoUpdateTime(node: VideoCopNode) {
		node.videoUpdateTime();
	}
	private async videoUpdateTime() {
		if (this._video) {
			const param = this.p.videoTime;
			if (param.isDirty()) {
				await param.compute();
			}
			this._videoUpdateTime(this._video);
		}
	}
	private async _videoUpdateTime(video: HTMLVideoElement) {
		video.currentTime = this.pv.videoTime;
	}
	// play
	static PARAM_CALLBACK_videoUpdatePlay(node: VideoCopNode) {
		node.videoUpdatePlay();
	}
	private videoUpdatePlay() {
		if (this._video) {
			this._videoUpdatePlay(this._video);
		}
	}
	private _videoUpdatePlay(video: HTMLVideoElement) {
		if (isBooleanTrue(this.pv.play)) {
			video.play();
		} else {
			video.pause();
		}
	}
	// muted
	static PARAM_CALLBACK_videoUpdateMuted(node: VideoCopNode) {
		node.videoUpdateMuted();
	}
	private videoUpdateMuted() {
		if (this._video) {
			this._videoUpdateMuted(this._video);
		}
	}
	private _videoUpdateMuted(video: HTMLVideoElement) {
		video.muted = isBooleanTrue(this.pv.muted);
	}
	// loop
	static PARAM_CALLBACK_videoUpdateLoop(node: VideoCopNode) {
		node.videoUpdateLoop();
	}
	private videoUpdateLoop() {
		if (this._video) {
			this._videoUpdateLoop(this._video);
		}
	}
	private _videoUpdateLoop(video: HTMLVideoElement) {
		video.loop = isBooleanTrue(this.pv.loop);
	}
	//
	// VIDEO CREATE / GET
	//
	//
	// private _createVideoElement(){
	// 	const mode = VIDEO_MODES[this.pv.mode]
	// 	switch(mode){
	// 		case VideoMode.FROM_URLS:{
	// 			return this._videoElementFromUrls()
	// 		}
	// 		case VideoMode.FROM_HTML_ELEMENT:{
	// 			return this._videoElementFromSelector()
	// 		}
	// 	}
	// 	TypeAssert.unreachable(mode)
	// }
	// private _videoElementFromUrls(){
	// 	const _createVideoTag=()=>{
	// 		const video = document.createElement('video')
	// 		this._videoUpdateLoop(video)
	// 		this._videoUpdateMuted(video)
	// 		video.setAttribute('crossOrigin', 'anonymous');
	// 		video.setAttribute('autoplay', `${true}`); // to ensure it loads
	// 		return video
	// 	}
	// 	const _addUrls=(video:HTMLVideoElement, urls:string[])=>{
	// 		for(let url of urls){
	// 			const source = document.createElement('source')
	// 			source.src = url;
	// 			video.append(source)
	// 			}
	// 	}
	// 	return _addUrls(_createVideoTag(),this._urlParams().map(p=>p.value))

	// }
	private async _videoTextureFromSelector(): Promise<VideoTexture | undefined> {
		const selector = this.pv.selector;
		const element = document.querySelector(selector);
		if (!element) {
			return;
		}
		if (!(element instanceof HTMLVideoElement)) {
			this.states.error.set(`element found with selector '${selector}' is not a video`);
			return;
		}

		const texture = new VideoTexture(element);
		return new Promise((resolve) => {
			if (CoreDomUtils.isHTMLVideoElementLoaded(element)) {
				resolve(texture);
			}
			element.onloadedmetadata = () => {
				resolve(texture);
			};
		});
	}

	//
	//
	// UTILS
	//
	//
	urlParams() {
		const urlsCount = this.pv.urlsCount;
		switch (urlsCount) {
			case 1: {
				return [this.p.url1];
			}
			case 2: {
				return [this.p.url1, this.p.url2];
			}
			case 3: {
				return [this.p.url1, this.p.url2, this.p.url3];
			}
		}
		return [];
	}
	private _urlsToLoad() {
		return this.urlParams().map((p) => p.value);
	}
	static PARAM_CALLBACK_reload(node: VideoCopNode, param: BaseParamType) {
		node.paramCallbackReload();
	}
	private paramCallbackReload() {
		// set the param dirty is preferable to just the successors, in case the expression result needs to be updated
		// this.p.url.set_successors_dirty();
		// this.p.url.setDirty();
		// this.p.url.emit(ParamEvent.ASSET_RELOAD_REQUEST);
		const urlParams = this.urlParams();
		for (let urlParam of urlParams) {
			urlParam.setDirty();
			urlParam.emit(ParamEvent.ASSET_RELOAD_REQUEST);
		}
	}

	private async _loadTexture() {
		const urls = this._urlsToLoad();
		let texture: Texture | VideoTexture | null = null;
		const loader = new CoreVideoTextureLoader(urls, this);
		try {
			texture = await loader.loadVideo();
			if (texture) {
				texture.matrixAutoUpdate = false;
			}
		} catch (e) {}
		if (!texture) {
			this.states.error.set(`could not load video from textures '${urls.join(',')}'`);
		}
		return texture;
	}
}
