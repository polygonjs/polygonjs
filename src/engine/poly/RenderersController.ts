import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Texture} from 'three/src/textures/Texture';
// import {NearestFilter, LinearEncoding, HalfFloatType} from 'three/src/constants'
// import EquirectangularToCubeGenerator from 'src/core/Utils/EquirectangularToCubeGenerator';
// import PMREMGenerator from 'src/core/Utils/PMREMGenerator';
// import PMREMCubeUVPacker from 'src/core/Utils/PMREMCubeUVPacker';

interface RendererByString {
	[propName: string]: WebGLRenderer;
}
interface TextureByString {
	[propName: string]: Texture;
}

interface POLYWebGLRenderer extends WebGLRenderer {
	_polygon_id: number;
}

const CONTEXT_OPTIONS = {
	antialias: true,
	// preserveDrawingBuffer: true, // this could only be useful to capture static images
};

type Callback = (value: WebGLRenderer) => void;

export class RenderersController {
	_next_renderer_id: number = 0;
	_next_env_map_id: number = 0;
	_renderers: RendererByString = {};
	_env_maps: TextureByString = {};
	private _require_webgl2: boolean = false;
	private _resolves: Callback[] = [];

	constructor() {}

	set_require_webgl2() {
		if (!this._require_webgl2) {
			this._require_webgl2 = true;
		}
	}
	rendering_context(canvas: HTMLCanvasElement): WebGLRenderingContext {
		let gl: WebGLRenderingContext | null = null;
		if (this._require_webgl2) {
			gl = this._rendering_context_webgl(canvas, true);
		}
		if (!gl) {
			gl = this._rendering_context_webgl(canvas, false);
		}

		// gl.getExtension('OES_standard_derivatives') // for derivative normals, but it cannot work at the moment (see node Gl/DerivativeNormals)
		// to test data texture
		// gl.getExtension('OES_texture_float')
		// gl.getExtension('OES_texture_float_linear')

		return gl;
	}
	private _rendering_context_webgl(canvas: HTMLCanvasElement, webgl2: boolean): WebGLRenderingContext {
		let context_name = webgl2 ? 'webgl2' : 'webgl';
		let gl = canvas.getContext(context_name, CONTEXT_OPTIONS);
		if (!gl) {
			context_name = webgl2 ? 'experimental-webgl2' : 'experimental-webgl';
			gl = canvas.getContext(context_name, CONTEXT_OPTIONS);
		}
		return gl as WebGLRenderingContext;
	}
	// private _rendering_context_webgl(
	// 	canvas: HTMLCanvasElement
	// ): WebGLRenderingContext {
	// 	let gl = canvas.getContext('webgl', CONTEXT_OPTIONS)
	// 	if (!gl) {
	// 		gl = canvas.getContext('experimental-webgl', CONTEXT_OPTIONS)
	// 	}
	// 	return gl as WebGLRenderingContext
	// }

	register_renderer(renderer: WebGLRenderer) {
		if ((renderer as POLYWebGLRenderer)._polygon_id) {
			throw new Error('render already registered');
		}
		(renderer as POLYWebGLRenderer)._polygon_id = this._next_renderer_id += 1;

		// there is a bug where 2 renderers are created from the beginning
		// because the from_json of the viewer_component is called after
		// the camera being set for the first time
		// console.log("register renderer", renderer, renderer._polygon_id)

		// this is being tested in PostProcess
		// const canvas = renderer.domElement
		// const gl = canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' )
		// const extension_exist = gl.getExtension('OES_standard_derivatives')
		// if(!extension_exist){
		// 	console.warn("renderers controller: gl extension not available")
		// }

		this._renderers[(renderer as POLYWebGLRenderer)._polygon_id] = renderer;

		if (Object.keys(this._renderers).length == 1) {
			this.flush_callbacks_with_renderer(renderer);
		}
	}
	deregister_renderer(renderer: WebGLRenderer) {
		delete this._renderers[(renderer as POLYWebGLRenderer)._polygon_id];
		renderer.dispose();
	}
	first_renderer(): WebGLRenderer | null {
		const first_id = Object.keys(this._renderers)[0];
		if (first_id) {
			return this._renderers[first_id];
		}
		return null;
	}
	renderers(): WebGLRenderer[] {
		return Object.values(this._renderers);
	}

	private flush_callbacks_with_renderer(renderer: WebGLRenderer) {
		let callback: Callback | undefined;
		while ((callback = this._resolves.pop())) {
			callback(renderer);
		}
	}

	async wait_for_renderer(): Promise<WebGLRenderer> {
		const renderer = this.first_renderer();
		if (renderer) {
			return renderer;
		} else {
			return new Promise((resolve, reject) => {
				this._resolves.push(resolve);
			});
		}
	}

	// async register_env_map(env_map: Texture){
	// 	console.log("register_env_map", env_map)
	// 	if(env_map._polygon_id){
	// 		throw new Error('cube_map already registered')
	// 	}
	// 	const texture = await this.prepare_env_map(env_map)
	// 	texture._polygon_id = (this._next_env_map_id += 1)
	// 	this._env_maps[texture._polygon_id] = texture
	// 	return texture
	// }
	// deregister_env_map(env_map: Texture){
	// 	console.log("deregister_env_map", env_map)
	// 	delete this._env_maps[env_map._polygon_id]
	// 	env_map.dispose()
	// }

	// private async prepare_env_map(texture: Texture): Texture{
	// 	texture.minFilter = NearestFilter;
	// 	texture.magFilter = NearestFilter;
	// 	texture.encoding = LinearEncoding;

	// 	await CoreScriptLoader.load_three('loaders/EXRLoader')
	// 	await CoreScriptLoader.load_three('loaders/EquirectangularToCubeGenerator')
	// 	const EquirectangularToCubeGenerator_name = 'EquirectangularToCubeGenerator'
	// 	const PMREMGenerator_name = 'PMREMGenerator'
	// 	const PMREMCubeUVPacker_name = 'PMREMCubeUVPacker'

	// 	const cubemapGenerator = new THREE[EquirectangularToCubeGenerator_name]( texture, { resolution: 512, type: HalfFloatType } );

	// 	const renderer = this.first_renderer()
	// 	if(renderer){
	// 		const cubeMapTexture = cubemapGenerator.update( renderer );

	// 		const pmremGenerator = new THREE[PMREMGenerator_name]( cubeMapTexture );
	// 		pmremGenerator.update( renderer );

	// 		const pmremCubeUVPacker = new THREE[PMREMCubeUVPacker_name]( pmremGenerator.cubeLods );
	// 		pmremCubeUVPacker.update( renderer );

	// 		renderer.gammaInput = false;
	// 		renderer.gammaOutput = true;

	// 		const exrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

	// 		texture.dispose();
	// 		cubemapGenerator.dispose();
	// 		pmremGenerator.dispose();
	// 		pmremCubeUVPacker.dispose();

	// 		return exrCubeRenderTarget.texture;
	// 	}
	// }
}
