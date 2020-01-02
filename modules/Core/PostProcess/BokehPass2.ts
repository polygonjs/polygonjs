import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer'
import {WebGLRenderTarget} from 'three/src/renderers/WebGLRenderTarget'
import {UniformsUtils} from 'three/src/renderers/shaders/UniformsUtils'
import {ShaderMaterial} from 'three/src/materials/ShaderMaterial'
import {Scene} from 'three/src/scenes/Scene'
import {RGBFormat} from 'three/src/constants'
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry'
import {OrthographicCamera} from 'three/src/cameras/OrthographicCamera'
import {Mesh} from 'three/src/objects/Mesh'
import {LinearFilter} from 'three/src/constants'
import {Camera} from 'three/src/cameras/Camera'
import {BokehShader, BokehDepthShader} from 'modules/three/examples/jsm/shaders/BokehShader2'
const THREE = {Camera, LinearFilter, Mesh, OrthographicCamera, PlaneBufferGeometry, RGBFormat, Scene, ShaderMaterial, UniformsUtils, WebGLRenderTarget, WebGLRenderer, BokehShader, BokehDepthShader}
import {BaseCamera} from 'src/Engine/Node/Obj/_BaseCamera'
import {CoreScene} from 'src/Core/Geometry/Scene'

import DepthInstanceVertex from './Gl/DepthInstance.vert.glsl'

export class BokehPass2 {

	private processing: object
	private _core_scene: CoreScene
	private materialDepth: THREE.ShaderMaterial
	private materialDepthInstance: THREE.ShaderMaterial
	private _uniforms: object = {}

	constructor(
		private _scene: THREE.Scene,
		private _camera: THREE.Camera,
		private _resolution: [number, number],
		private _camera_node: BaseCamera
	){
		this.init()
	}

	init(){
		this.processing = { enabled: true };
		const shaderSettings = {
			rings: 3,
			samples: 4
		};


		this.processing.scene = new THREE.Scene();

		this.processing.camera = new THREE.OrthographicCamera( this._resolution[0] / - 2, this._resolution[0] / 2, this._resolution[1] / 2, this._resolution[1] / - 2, - 10000, 10000 );
		this.processing.camera.position.z = 100;

		this.processing.scene.add( this.processing.camera );

		var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
		this.processing.rtTextureDepth = new THREE.WebGLRenderTarget( this._resolution[0], this._resolution[1], pars );
		this.processing.rtTextureColor = new THREE.WebGLRenderTarget( this._resolution[0], this._resolution[1], pars );

		var bokeh_shader = THREE.BokehShader;
		if(!bokeh_shader){
			console.error( "THREE.BokehPass relies on THREE.BokehShader" );
		}

		this.processing.bokeh_uniforms = THREE.UniformsUtils.clone( bokeh_shader.uniforms );

		this.processing.bokeh_uniforms[ 'tColor' ].value = this.processing.rtTextureColor.texture;
		this.processing.bokeh_uniforms[ 'tDepth' ].value = this.processing.rtTextureDepth.texture;
		this.processing.bokeh_uniforms[ 'textureWidth' ].value = this._resolution[0]
		this.processing.bokeh_uniforms[ 'textureHeight' ].value = this._resolution[1]

		this.processing.materialBokeh = new THREE.ShaderMaterial( {

			uniforms: this.processing.bokeh_uniforms,
			vertexShader: bokeh_shader.vertexShader,
			fragmentShader: bokeh_shader.fragmentShader,
			defines: {
				RINGS: shaderSettings.rings,
				SAMPLES: shaderSettings.samples
			}

		} );

		this.processing.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( this._resolution[0], this._resolution[1] ), this.processing.materialBokeh );
		this.processing.quad.position.z = - 500;
		this.processing.scene.add( this.processing.quad );


		// depth shader
		var depthShader = THREE.BokehDepthShader;
		if(!depthShader){
			console.error( "THREE.BokehPass relies on THREE.BokehDepthShader" );
		}

		this.materialDepth = new THREE.ShaderMaterial( {
			uniforms: depthShader.uniforms,
			vertexShader: depthShader.vertexShader,
			fragmentShader: depthShader.fragmentShader
		} );

		// add a shader similar to this.materialDepth, but that works with instances
		this.materialDepthInstance = new THREE.ShaderMaterial( {
			uniforms: depthShader.uniforms,
			vertexShader: DepthInstanceVertex,
			fragmentShader: depthShader.fragmentShader
		} );

		this._uniforms = {
			mNear: {value: this._camera.near},
			mFar: {value: this._camera.far},
		}

		for(let material of [this.materialDepth, this.materialDepthInstance]){
			material.uniforms[ 'mNear' ].value = this._uniforms['mNear']
			material.uniforms[ 'mFar' ].value = this._uniforms['mFar']
		}

	}

	setSize( width, height ) {

		this.processing.rtTextureDepth.setSize( width, height );
		this.processing.rtTextureColor.setSize( width, height );

		this.processing.bokeh_uniforms[ 'textureWidth' ].value = width
		this.processing.bokeh_uniforms[ 'textureHeight' ].value = height

	}

	dispose(){
		this.processing.rtTextureDepth.dispose();
		this.processing.rtTextureColor.dispose();
	}

	render(
		renderer: THREE.WebGLRenderer,
		writeBuffer: THREE.WebGLRenderTarget,
		readBuffer: THREE.WebGLRenderTarget
	){
		const debug_display_depth = false
		const prev_clear_color = renderer.getClearColor()
		renderer.setClearColor( this._camera_node.background_color() )

		renderer.clear();

		// render scene into texture

		renderer.setRenderTarget( this.processing.rtTextureColor );
		renderer.clear();
		renderer.render( this._scene, this._camera );
		renderer.setClearColor( 0x000000 ) // cancels the bg color

		// render depth into texture

		this._core_scene = this._core_scene || new CoreScene(this._scene)
		this._core_scene.with_overriden_material(this.materialDepth, this.materialDepthInstance, this._uniforms, ()=>{
			// this._scene.overrideMaterial = this.materialDepth;
			if(debug_display_depth){
				renderer.setRenderTarget( null );
			} else {
				renderer.setRenderTarget( this.processing.rtTextureDepth );
			}
			renderer.clear();
			renderer.render( this._scene, this._camera );
			// this._scene.overrideMaterial = null;
		})
		// render bokeh composite

		if(!debug_display_depth){
			renderer.setRenderTarget( null );
			renderer.clear();
			renderer.render( this.processing.scene, this.processing.camera );
		}

		renderer.setClearColor( prev_clear_color )
	}

}