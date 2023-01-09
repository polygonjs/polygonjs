import {
	// BoxGeometry,
	// Mesh,
	// MeshNormalMaterial,
	// DoubleSide,
	Color,
	Group,
	Matrix4,
	Texture,
} from 'three';
import {
	ArToolkitProfile,
	ArToolkitSource,
	ArToolkitContext,
	ArMarkerControls,
	ArControllerOrientation,
	// ArSmoothedControls
} from './arjs';
import {
	ArChangeMatrixMode,
	ARjsBarCodeType,
	changeMatrixModeFromTransformMode,
	CoreARjsControllerOptions,
	CoreCameraARjsControllerConfig,
} from './Common';

const USE_WEBCAM: boolean = true;
const USE_BARCODE: boolean = true;
const BARCODE_SIMPLE: boolean = false;
const FROM_OPTIONS: boolean = true;
// const profileSource = '/clients/me/arjs/marker-artoolkit-pattern-pattratio-09.png';
const profileSource = USE_BARCODE
	? BARCODE_SIMPLE
		? '/clients/me/arjs/bg_with_barcode.jpg'
		: '/clients/me/arjs/bg_with_barcode_114.jpg'
	: '/clients/me/arjs/marker-artoolkit-pattern-pattratio-09.png';
// const profileSource = '/clients/me/arjs/image_with_barcode.jpg';
// const profileSource = '/clients/me/arjs/pattern-arjs.png';
// const patternUrl = USE_WEBCAM ? '/clients/me/arjs/pattern-hiro.patt' : '/clients/me/arjs/pattern-arjs.patt';
const patternUrl = '/clients/me/arjs/pattern-arjs.patt';
// from arjs example default-thinner-border.html

export const AR_CHANGE_MATRIX_MODES: ArChangeMatrixMode[] = ['cameraTransformMatrix', 'modelViewMatrix'];
export class CoreARjsController {
	private _profile: ArToolkitProfile;
	private _source: ArToolkitSource;
	private _context?: ArToolkitContext;
	protected _controls?: ArMarkerControls;
	// private _smoothedControls?: ArSmoothedControls;
	private _markerGroup: Group = new Group();

	// private _smoothedGroup: Group = new Group();
	// private renderer:WebGLRenderer
	// private canvas: HTMLCanvasElement;
	// private camera: Camera;
	// private scene: Scene;
	// private barCodeValue: number;
	private changeMatrixMode: ArChangeMatrixMode;
	constructor(protected options: CoreARjsControllerOptions) {
		this.changeMatrixMode = changeMatrixModeFromTransformMode(options.transformMode);
		// this.renderer = options.renderer;
		// this.canvas = options.canvas;
		// this.camera = options.camera;
		// this.scene = options.scene;
		// this.barCodeValue = options.barCode.value;

		// const patterUrl = '/clients/me/arjs/pattern-arjs.patt';

		this._profile = new ArToolkitProfile();
		// artoolkitProfile.sourceWebcam()
		if (USE_WEBCAM) {
			this._profile.sourceWebcam();
		} else {
			this._profile.sourceImage(profileSource);
		}
		this._profile.contextParameters.labelingMode = USE_BARCODE ? undefined : 'black_region';
		this._profile.contextParameters.detectionMode = USE_BARCODE ? 'mono_and_matrix' : 'mono';
		this._profile.contextParameters.matrixCodeType = FROM_OPTIONS
			? options.barCode.type
			: BARCODE_SIMPLE
			? ARjsBarCodeType._3x3
			: ARjsBarCodeType._4x4_BCH_13_9_3;
		this._profile.contextParameters.patternRatio = 0.5;

		if (USE_WEBCAM) {
			this._source = new ArToolkitSource({
				sourceType: 'webcam',
				sourceWidth: 640,
				sourceHeight: 480,
			});
		} else {
			this._source = new ArToolkitSource(this._profile.sourceParameters);
		}
		this._source.init(() => {
			if (USE_WEBCAM == true) {
				this._source.domElement.addEventListener('canplay', () => {
					this._initContext();
				});
			}
		});

		if (USE_WEBCAM == false) {
			this._initContext();
		}
	}
	private _controlTarget() {
		return this.changeMatrixMode == 'cameraTransformMatrix' ? this.options.camera : this._markerGroup;
	}
	private _initContext() {
		const {canvas, barCode} = this.options;
		this._context = new ArToolkitContext(this._profile.contextParameters);
		this._context.init(this._onContextCompletedBound);

		// const changeMatrixMode: ArChangeMatrixMode = AR_CHANGE_MATRIX_MODES[0];

		this._controls = new ArMarkerControls(this._context, this._controlTarget(), {
			type: USE_BARCODE ? 'barcode' : 'pattern',
			// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro',
			patternUrl: USE_BARCODE ? undefined : patternUrl,
			changeMatrixMode: this.changeMatrixMode,
			barcodeValue: FROM_OPTIONS ? barCode.value : BARCODE_SIMPLE ? 0 : 114,
			smooth: true,
			smoothCount: 5,
			smoothTolerance: 0.01,
			smoothThreshold: 2,
		});

		// build a smoothedControls
		// this._smoothedControls = new ArSmoothedControls(this._smoothedGroup);

		// const geometry = new BoxGeometry(1, 1, 1);
		// const material = new MeshNormalMaterial({
		// 	transparent: true,
		// 	opacity: 0.5,
		// 	side: DoubleSide,
		// });
		// const mesh = new Mesh(geometry, material);
		// mesh.position.y = geometry.parameters.height / 2;
		// this._markerGroup.add(mesh);

		// append video to renderer
		if (this.changeMatrixMode == 'cameraTransformMatrix') {
			const video = this._source.domElement;
			canvas.parentElement?.prepend(video);
			video.style.position = 'absolute';
			video.style.height = '100%';
			video.style.top = '0px';
			video.style.left = '50%';
			video.style.transform = 'translate(-50%, 0%)';
			video.style.zIndex = '1';
			canvas.style.zIndex = '2';
			canvas.style.position = 'relative';
		}
		// const videoElement = this._source.domElement;
		// if (!videoElement) {
		// 	return;
		// }
		// videoElement.style.zIndex = '999';
		// videoElement.style.position = 'fixed';
		// videoElement.style.top = '50%';
		// videoElement.style.left = '50%';

		// trigger resize
		window.dispatchEvent(new Event('resize'));
	}

	config(): CoreCameraARjsControllerConfig {
		return {
			renderFunction: this.renderBound,
			mountFunction: this.mountBound,
			unmountFunction: this.unmountBound,
			// resizeFunction: this._onResizeBound,
		};
	}
	renderBound = this.render.bind(this);
	mountBound = this.mount.bind(this);
	unmountBound = this.unmount.bind(this);

	private _previousSceneBackground: Color | Texture | null = null;
	// private _videoTexture: VideoTexture | null = null;
	mount() {
		const {scene} = this.options;
		this._previousSceneBackground = scene.background;
		scene.background = null;
		scene.add(this._markerGroup);
		// scene.add(this._smoothedGroup);
	}
	unmount() {
		const {scene} = this.options;
		scene.background = this._previousSceneBackground;
		scene.remove(this._markerGroup);
		// scene.remove(this._smoothedGroup);
	}

	render() {
		if (!this._source.ready) {
			return;
		}
		if (!this._context) {
			return;
		}

		this._context.update(this._source.domElement);
		// this._smoothedControls.update(this._markerGroup);
	}
	matrix(targetMatrix: Matrix4) {
		targetMatrix.copy(this._controlTarget().matrix);
	}

	private _onContextCompletedBound = this._onContextCompleted.bind(this);
	private _onContextCompleted() {
		if (!this._context) {
			return;
		}
		const {camera} = this.options;
		camera.projectionMatrix.copy(this._context.getProjectionMatrix());

		const arController = this._context.arController;
		if (!arController) {
			console.error('no arController created');
			return;
		}

		if (!USE_WEBCAM) {
			return;
		}
		const source = this._source;
		const getSourceOrientation: () => ArControllerOrientation = () => {
			if (!source) {
				console.warn('no source');
				return null;
			}

			const domElement = source.domElement;
			if (!(domElement instanceof HTMLVideoElement)) {
				console.warn('domElement is not a video');
				return null;
			}

			if (domElement.videoWidth > domElement.videoHeight) {
				return 'landscape';
			} else {
				return 'portrait';
			}
		};
		const orientation = getSourceOrientation();
		arController.orientation = orientation;
		arController.options.orientation = orientation;
	}

	// private _onResizeBound = this._onResize.bind(this);
	// private _onResize() {
	// 	// console.warn('onResize');
	// 	// this._source.onResizeElement();
	// 	// this._source.copyElementSizeTo(this.renderer.domElement);
	// 	// if (this._context.arController !== null) {
	// 	// 	this._source.copyElementSizeTo(this._context.arController.canvas);
	// 	// }
	// }
}
