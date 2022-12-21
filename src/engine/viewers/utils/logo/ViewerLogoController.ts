import {CircleGeometry, WebGLRenderer} from 'three';
import {Mesh} from 'three';
import {MeshBasicMaterial} from 'three';
import {OrthographicCamera} from 'three';
import {RepeatWrapping, sRGBEncoding} from 'three';
import {Scene} from 'three';
import {Texture} from 'three';
import {Vector2} from 'three';
import {Vector4} from 'three';
import {BaseViewerType} from '../../_Base';
import {Poly} from '../../../Poly';
import {Camera} from 'three';

const CAMERA_VIEW = 0.5;
const ICON_SIZE = 32;
const MARGIN = 10;

export class ViewerLogoController {
	constructor(private _viewer: BaseViewerType) {
		const canvas = this._viewer.canvas();
		this._setupRenderer();
		this._setupEvents(canvas);
	}

	private _scene: Scene = this._createScene();
	private _camera: Camera = this._createCamera();
	private _createScene() {
		const datauri = Poly.logo.datauri() || '';
		const texture = new Texture();
		texture.wrapS = RepeatWrapping;
		texture.wrapT = RepeatWrapping;
		texture.center.set(0.5, 0.5);
		texture.repeat.set(1, 1);
		const img = document.createElement('img');
		texture.image = img;
		texture.encoding = sRGBEncoding;
		img.onload = () => {
			texture.needsUpdate = true;
		};
		img.src = datauri;
		const plane = new CircleGeometry(0.5, 128);
		plane.rotateZ(Math.PI * 0.5);
		plane.rotateZ(Math.PI * -0.5);
		const mat = new MeshBasicMaterial({map: texture});
		const mesh = new Mesh(plane, mat);
		mesh.matrixAutoUpdate = false;
		const scene = new Scene();
		scene.matrixAutoUpdate = false;
		scene.add(mesh);
		return scene;
	}
	private _createCamera() {
		const camera = new OrthographicCamera(-CAMERA_VIEW, CAMERA_VIEW, CAMERA_VIEW, -CAMERA_VIEW, 1, 10);
		camera.position.set(0, 0, 5);
		camera.updateMatrix();
		camera.matrixAutoUpdate = false;
		return camera;
	}

	private _setupRenderer() {
		const currentViewport = new Vector4();
		this._viewer.registerOnAfterRender(
			'logo',
			(delta, renderer) => {
				if (!(renderer instanceof WebGLRenderer)) {
					return;
				}
				// save previous renderer parameters
				const previousAutoClear = renderer.autoClear;
				renderer.getCurrentViewport(currentViewport);

				// render
				renderer.autoClear = false;
				renderer.setViewport(MARGIN, MARGIN, ICON_SIZE, ICON_SIZE);
				renderer.render(this._scene, this._camera);

				//restore renderer parameters
				renderer.autoClear = previousAutoClear;
				renderer.setViewport(currentViewport.divideScalar(renderer.getPixelRatio()));
			},
			{persistent: true}
		);
	}
	private _iconHovered = false;
	private _setupEvents(canvas: HTMLCanvasElement) {
		const mousePos = new Vector2();
		canvas.addEventListener('mousemove', (event) => {
			const height = canvas.getBoundingClientRect().height;
			mousePos.set(event.offsetX, height - event.offsetY);
			if (
				mousePos.x >= MARGIN &&
				mousePos.x <= MARGIN + ICON_SIZE &&
				mousePos.y >= MARGIN &&
				mousePos.y <= MARGIN + ICON_SIZE
			) {
				this.updateIconHoveredState(true, canvas);
			} else {
				this.updateIconHoveredState(false, canvas);
			}
		});

		canvas.addEventListener('pointerup', (event) => {
			if (this._iconHovered) {
				// the event is on pointerup
				// and with a timeout,
				// to try and alleviate the effect
				// where the camera controls spin strongly
				// when the user comes back to the original tab
				setTimeout(() => {
					this._openPolygonjsPage();
				}, 10);
			}
		});
	}
	updateIconHoveredState(state: boolean, canvas: HTMLCanvasElement) {
		if (state != this._iconHovered) {
			this._iconHovered = state;
			if (this._iconHovered) {
				canvas.style.cursor = 'pointer';
			} else {
				canvas.style.removeProperty('cursor');
			}
		}
	}

	_openPolygonjsPage() {
		const link = document.createElement('a');
		link.setAttribute('target', '_blank');
		const redirectUrl = Poly.logo.redirectUrl();
		link.setAttribute('href', redirectUrl);
		link.click();
	}
}
