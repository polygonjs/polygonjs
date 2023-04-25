import {
	Object3D,
	Material,
	Vector2,
	Vector4,
	Camera,
	WebGLRenderTarget,
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	FloatType,
	WebGLRenderer,
	Scene,
	NoToneMapping,
	LinearEncoding,
} from 'three';
import {NamedFunction2, ObjectNamedFunction4} from './_Base';

export class cursorToUv extends NamedFunction2<[Vector2, Vector2]> {
	static override type() {
		return 'cursorToUv';
	}
	func(cursor: Vector2, target: Vector2): Vector2 {
		target.x = 0.5 * (cursor.x + 1);
		target.y = 0.5 * (1 - cursor.y);

		return target;
	}
}
interface Object3DRestoreContext {
	parent: Object3D | null;
	// background: Color | Texture | null;
}
// interface SceneRestoreContext {
// 	overrideMaterial: Material | null;
// 	// background: Color | Texture | null;
// }
interface RendererRestoreContext {
	toneMapping: number;
	outputEncoding: number;
}
interface RestoreContext {
	object: Object3DRestoreContext;
	// scene: SceneRestoreContext;
	renderer: RendererRestoreContext;
}

export class renderPixel extends ObjectNamedFunction4<[Material, Camera, Vector2, Vector4]> {
	private _renderTarget: WebGLRenderTarget = new WebGLRenderTarget(1, 1, {
		minFilter: LinearFilter,
		magFilter: NearestFilter,
		format: RGBAFormat,
		type: FloatType,
	});
	private _renderScene = new Scene();
	private _restoreContext: RestoreContext = {
		object: {
			parent: null,
		},
		// scene: {
		// 	overrideMaterial: null,
		// },
		renderer: {
			toneMapping: -1,
			outputEncoding: -1,
		},
	};
	private _read = new Float32Array(4);
	static override type() {
		return 'renderPixel';
	}
	func(object3D: Object3D, material: Material, camera: Camera, uv: Vector2, target: Vector4): Vector4 {
		const renderer = this.scene.renderersRegister.lastRegisteredRenderer();
		if (!renderer) {
			return target;
		}
		if (!(renderer instanceof WebGLRenderer)) {
			console.log('renderPixel: renderer found is not WebGLRenderer');
			return target;
		}

		this._prepare(object3D, material, renderer);
		this._render(uv, camera, renderer, target);
		this._restore(object3D, material, renderer);

		return target;
	}

	private _prepare(object3D: Object3D, material: Material, renderer: WebGLRenderer) {
		// save context
		this._restoreContext.renderer.outputEncoding = renderer.outputEncoding;
		this._restoreContext.renderer.toneMapping = renderer.toneMapping;
		this._restoreContext.object.parent = object3D.parent;

		// set context
		this._renderScene.overrideMaterial = material;
		this._renderScene.attach(object3D);
		renderer.toneMapping = NoToneMapping;
		renderer.outputEncoding = LinearEncoding;
	}
	private _render(uv: Vector2, camera: Camera, renderer: WebGLRenderer, target: Vector4) {
		(camera as any).setViewOffset(
			renderer.domElement.width,
			renderer.domElement.height,
			uv.x * renderer.domElement.width,
			uv.y * renderer.domElement.height,
			1,
			1
		);

		renderer.setRenderTarget(this._renderTarget);
		renderer.clear();
		renderer.render(this._renderScene, camera);
		renderer.setRenderTarget(null);
		(camera as any).clearViewOffset();
		renderer.readRenderTargetPixels(this._renderTarget, 0, 0, 1, 1, this._read);
		target.fromArray(this._read);
	}
	private _restore(object3D: Object3D, material: Material, renderer: WebGLRenderer) {
		renderer.outputEncoding = this._restoreContext.renderer.outputEncoding;
		renderer.toneMapping = this._restoreContext.renderer.toneMapping;
		this._restoreContext.object.parent?.attach(object3D);
	}
}
