import {
	BoxGeometry,
	Camera,
	DoubleSide,
	Group,
	Mesh,
	MeshNormalMaterial,
	Scene,
	// WebGLRenderer
} from 'three';
import {ArToolkitProfile, ArToolkitSource, ArToolkitContext, ArMarkerControls, ArSmoothedControls} from './arjs';
import {CoreARjsControllerOptions, CoreCameraARjsControllerConfig} from './Common';

// from arjs example default-thinner-border.html
export class CoreARjsController {
	private _profile: ArToolkitProfile;
	private _source: ArToolkitSource;
	private _context: ArToolkitContext;
	protected _controls: ArMarkerControls;
	private _smoothedControls: ArSmoothedControls;
	private _markerGroup: Group = new Group();
	private _smoothedGroup: Group = new Group();
	// private renderer:WebGLRenderer
	private camera: Camera;
	private scene: Scene;
	constructor(options: CoreARjsControllerOptions) {
		// this.renderer = options.renderer;
		this.camera = options.camera;
		this.scene = options.scene;
		// const profileSource = '/clients/me/arjs/marker-artoolkit-pattern-pattratio-09.png';
		// const patterUrl = '/clients/me/arjs/pattern-arjs.patt';
		const patterUrl = '/clients/me/arjs/patt.hiro';

		this._profile = new ArToolkitProfile();
		// artoolkitProfile.sourceWebcam()
		this._profile.sourceWebcam();
		// this._profile.sourceImage(profileSource);
		this._profile.contextParameters.patternRatio = 0.9;

		console.log(this._profile, this._profile.sourceParameters);
		this._source = new ArToolkitSource(this._profile.sourceParameters);
		this._source.init(() => window.dispatchEvent(new Event('resize')));

		this._context = new ArToolkitContext(this._profile.contextParameters);
		this._context.init(this._onContextCompletedBound);

		this._controls = new ArMarkerControls(this._context, this._markerGroup, {
			type: 'pattern',
			// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro',
			patternUrl: patterUrl,
		});
		console.log(this._controls);

		// build a smoothedControls
		this._smoothedControls = new ArSmoothedControls(this._smoothedGroup);

		const geometry = new BoxGeometry(1, 1, 1);
		const material = new MeshNormalMaterial({
			transparent: true,
			opacity: 0.5,
			side: DoubleSide,
		});
		const mesh = new Mesh(geometry, material);
		mesh.position.y = geometry.parameters.height / 2;
		this._markerGroup.add(mesh);
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

	mount() {
		this.scene.add(this._markerGroup);
		this.scene.add(this._smoothedGroup);
	}
	unmount() {
		this.scene.remove(this._markerGroup);
		this.scene.remove(this._smoothedGroup);
	}

	render() {
		if (!this._source.ready) {
			return;
		}

		this._context.update(this._source.domElement);
		this._smoothedControls.update(this._markerGroup);
		console.log(this._markerGroup.matrix.elements);
	}

	private _onContextCompletedBound = this._onContextCompleted.bind(this);
	private _onContextCompleted() {
		this.camera.projectionMatrix.copy(this._context.getProjectionMatrix());
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
