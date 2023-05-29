import {ThreejsViewer, ThreejsViewerOptions, ThreejsViewerSetupData} from './Threejs';
import {
	PhysicalCamera,
	// @ts-ignore
} from 'three-gpu-pathtracer';
import {PathTracingRendererContainer} from '../nodes/rop/utils/pathTracing/PathTracingRendererContainer';

// type RenderFuncWithDeltaAsync = (delta: number) => Promise<void>;
type OnFrameCompleted = () => Promise<void>;
interface RecordingStateOptions {
	isRecording: boolean;
	// onSampleCompleted?: OnSampleCompleted;
	onFrameCompleted?: OnFrameCompleted;
	recordingSamplesPerFrame?: number;
	// sleepCallback?: SleepCallback;
	// setTimeout?: SetTimeoutCallback;
	// requestAnimationFrame?: RequestAnimationFrame;
}

/**
 *
 *
 * pathtracing viewers are created by adding the [PathTracingRenderer](/docs/nodes/rop/PathTracingRenderer) to a camera. They inherit from [ThreejsViewer](/docs/api/ThreejsViewer).
 *
 */

export class PathTracingViewer<C extends PhysicalCamera> extends ThreejsViewer<PhysicalCamera> {
	protected override _renderer: PathTracingRendererContainer | undefined;
	private _debugElement: HTMLElement | undefined;
	// private _rendering: boolean = false;
	// protected override _renderFunc: RenderFuncWithDeltaAsync | undefined;
	protected override _setupFunctions(options: ThreejsViewerOptions<C>): ThreejsViewerSetupData<C> | void {
		const data = super._setupFunctions(options);
		if (data) {
			const {renderer, renderScene, camera} = data;
			if (renderer instanceof PathTracingRendererContainer) {
				this._renderFunc = () => {
					if (this._isRecording) {
						if (renderer.pbrRenderAllowed()) {
							renderer.render(renderScene, camera);
							this.updateDebugDisplay();

							if (renderer.samplesCount() >= this._recordingSamplesPerFrame && this._onFrameCompleted) {
								renderer.markAsNotGenerated();
								this._onFrameCompleted();
							}
						}
					} else {
						renderer.render(renderScene, camera);
						this.updateDebugDisplay();
					}
				};
				renderer.generate(renderScene);
			}
		}
	}

	override mount(element: HTMLElement) {
		super.mount(element);

		if (this._errorMessage) {
			return;
		}
		if (!this._renderer) {
			return;
		}
		if (this._renderer.displayDebug) {
			this._debugElement = document.createElement('div');
			this._debugElement.style.position = 'absolute';
			this._debugElement.style.top = '5px';
			this._debugElement.style.right = '5px';
			this._debugElement.style.padding = '2px 5px';
			this._debugElement.style.color = 'black';
			this._debugElement.style.backgroundColor = 'white';
			this._debugElement.style.opacity = '60%';
			this._debugElement.style.fontSize = '0.6rem';
			this._debugElement.style.textAlign = 'right';
			this._debugElement.style.fontFamily = 'monospace';
			this._domElement?.append(this._debugElement);
			this.updateDebugDisplay();
		}
	}
	private _isRecording: boolean = false;
	private _onFrameCompleted: OnFrameCompleted | undefined;
	private _recordingSamplesPerFrame: number = 500;
	setRecordingState(options: RecordingStateOptions) {
		this._isRecording = options.isRecording;
		this._onFrameCompleted = options.onFrameCompleted;
		this._recordingSamplesPerFrame =
			options.recordingSamplesPerFrame != null
				? options.recordingSamplesPerFrame
				: this._recordingSamplesPerFrame;
		this._renderer?.reset();
	}
	updateDebugDisplay() {
		if (!this._debugElement) {
			return;
		}
		const samples = this._renderer?.samplesCount() || 0;
		this._debugElement.innerText = `${samples}`.padStart(3, '0');
	}
	override dispose() {
		this._renderer?.dispose();
		super.dispose();
		this._debugElement?.remove();
	}

	protected override _animateWebBound: () => void = this._animateWeb.bind(this);
	protected override _animateWeb() {
		if (!this._doRender) {
			return;
		}
		// this._requestAnimationFrameId = requestAnimationFrame(this._animateWebBound);
		this.__animateCommon__();
	}
	protected override _postRender(delta: number) {
		const renderer = this._renderer;
		if (!renderer) {
			return;
		}

		this._runOnBeforeRenderCallbacks(delta, renderer);
		if (this._renderFunc) {
			this._renderFunc(delta);
		}
		if (this._renderCSSFunc) {
			this._renderCSSFunc();
		}
		this.controlsController().update(delta);
		this._runOnAfterRenderCallbacks(delta, renderer);
		this._requestAnimationFrameId = requestAnimationFrame(this._animateWebBound);
	}
}
