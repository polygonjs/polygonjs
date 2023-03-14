import {ThreejsViewer, ThreejsViewerOptions, ThreejsViewerSetupData} from './Threejs';
import {
	PhysicalCamera,
	// @ts-ignore
} from 'three-gpu-pathtracer';
import {PathTracingRendererContainer} from '../nodes/rop/utils/pathTracing/PathTracingRendererContainer';

type RenderFuncWithDeltaAsync = (delta: number) => Promise<void>;

/**
 *
 *
 * pathtracing viewers are created by adding the [PathTracingRenderer](/docs/nodes/rop/PathTracingRenderer) to a camera. They inherit from [ThreejsViewer](/docs/api/ThreejsViewer).
 *
 */

export class PathTracingViewer<C extends PhysicalCamera> extends ThreejsViewer<PhysicalCamera> {
	protected override _renderer: PathTracingRendererContainer | undefined;
	private _debugElement: HTMLElement | undefined;
	private _rendering: boolean = false;
	protected override _renderFunc: RenderFuncWithDeltaAsync | undefined;
	protected override _setupFunctions(options: ThreejsViewerOptions<C>): ThreejsViewerSetupData<C> | void {
		const data = super._setupFunctions(options);
		if (data) {
			const {renderer, renderScene, camera} = data;
			if (renderer instanceof PathTracingRendererContainer) {
				this._renderFunc = async () => {
					if (this._rendering) {
						return;
					}
					this._rendering = true;
					await renderer.render(renderScene, camera);
					this._rendering = false;
					this.updateDebugDisplay();
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
	updateDebugDisplay() {
		if (!this._debugElement) {
			return;
		}
		const samples = this._renderer?.samplesCount() || 0;
		this._debugElement.innerText = `${samples}`.padStart(3, '0');
	}
	override dispose() {
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
	protected override async _postRender(delta: number) {
		const renderer = this._renderer;
		if (!renderer) {
			return;
		}

		this._runOnBeforeRenderCallbacks(delta, renderer);
		if (this._renderFunc) {
			await this._renderFunc(delta);
		}
		if (this._renderCSSFunc) {
			this._renderCSSFunc();
		}
		this.controlsController().update(delta);
		this._runOnAfterRenderCallbacks(delta, renderer);
		this._requestAnimationFrameId = renderer.requestAnimationFrame(this._animateWebBound);
	}
}
