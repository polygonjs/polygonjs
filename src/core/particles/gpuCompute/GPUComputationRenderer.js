/**
 * GPUComputationRenderer, based on SimulationRenderer by zz85
 *
 * The GPUComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats
 * for each compute element (texel)
 *
 * Each variable has a fragment shader that defines the computation made to obtain the variable in question.
 * You can use as many variables you need, and make dependencies so you can use textures of other variables in the shader
 * (the sampler uniforms are added automatically) Most of the variables will need themselves as dependency.
 *
 * The renderer has actually two render targets per variable, to make ping-pong. Textures from the current frame are used
 * as inputs to render the textures of the next frame.
 *
 * The render targets of the variables can be used as input textures for your visualization shaders.
 *
 * Variable names should be valid identifiers and should not collide with THREE GLSL used identifiers.
 * a common approach could be to use 'texture' prefixing the variable name; i.e texturePosition, textureVelocity...
 *
 * The size of the computation (sizeX * sizeY) is defined as 'resolution' automatically in the shader. For example:
 * #DEFINE resolution vec2( 1024.0, 1024.0 )
 *
 * -------------
 *
 * Basic use:
 *
 * // Initialization...
 *
 * // Create computation renderer
 * var gpuCompute = new GPUComputationRenderer( 1024, 1024, renderer );
 *
 * // Create initial state float textures
 * var pos0 = gpuCompute.createTexture();
 * var vel0 = gpuCompute.createTexture();
 * // and fill in here the texture data...
 *
 * // Add texture variables
 * var velVar = gpuCompute.addVariable( "textureVelocity", fragmentShaderVel, pos0 );
 * var posVar = gpuCompute.addVariable( "texturePosition", fragmentShaderPos, vel0 );
 *
 * // Add variable dependencies
 * gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );
 * gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );
 *
 * // Add custom uniforms
 * velVar.material.uniforms.time = { value: 0.0 };
 *
 * // Check for completeness
 * var error = gpuCompute.init();
 * if ( error !== null ) {
 *		console.error( error );
 * }
 *
 *
 * // In each frame...
 *
 * // Compute!
 * gpuCompute.compute();
 *
 * // Update texture uniforms in your visualization materials with the gpu renderer output
 * myMaterial.uniforms.myTexture.value = gpuCompute.getCurrentRenderTarget( posVar ).texture;
 *
 * // Do your rendering
 * renderer.render( myScene, myCamera );
 *
 * -------------
 *
 * Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures)
 * Note that the shaders can have multiple input textures.
 *
 * var myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );
 * var myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );
 *
 * var inputTexture = gpuCompute.createTexture();
 *
 * // Fill in here inputTexture...
 *
 * myFilter1.uniforms.theTexture.value = inputTexture;
 *
 * var myRenderTarget = gpuCompute.createRenderTarget();
 * myFilter2.uniforms.theTexture.value = myRenderTarget.texture;
 *
 * var outputRenderTarget = gpuCompute.createRenderTarget();
 *
 * // Now use the output texture where you want:
 * myMaterial.uniforms.map.value = outputRenderTarget.texture;
 *
 * // And compute each frame, before rendering to screen:
 * gpuCompute.doRenderTarget( myFilter1, myRenderTarget );
 * gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );
 *
 *
 *
 * @param {int} sizeX Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {int} sizeY Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {WebGLRenderer} renderer The renderer
 */

import {
	Camera,
	ClampToEdgeWrapping,
	FloatType,
	NearestFilter,
	RGBAFormat,
	DataTexture,
	Mesh,
	PlaneGeometry,
	Scene,
	ShaderMaterial,
	WebGLRenderTarget,
} from 'three';
import {ref} from '@vue/reactivity';

var GPUComputationRenderer = function (sizeX, sizeY, renderer) {
	this.variables = [];

	this.currentTextureIndex = 0;

	var dataType = FloatType;

	var scene = new Scene();
	scene.matrixAutoUpdate = false;

	var camera = new Camera();
	camera.position.z = 1;
	camera.matrixAutoUpdate = false;
	camera.updateMatrix();

	var passThruUniforms = {
		passThruTexture: {value: null},
	};

	var passThruShader = createShaderMaterial(getPassThroughFragmentShader(), passThruUniforms);

	const plane = new PlaneGeometry(2, 2);
	var mesh = new Mesh(plane, passThruShader);
	mesh.matrixAutoUpdate = false;
	mesh.updateMatrix();
	scene.add(mesh);

	this.dispose = function () {
		// scene.dispose();
		passThruShader.dispose();
		plane.dispose();
	};

	this.setDataType = function (type) {
		dataType = type;
		return this;
	};

	this.addVariable = function (variableName, computeFragmentShader, initialValueTexture) {
		var material = this.createShaderMaterial(computeFragmentShader);

		var variable = {
			name: variableName,
			initialValueTexture: initialValueTexture,
			material: material,
			dependencies: null,
			renderTargets: [],
			wrapS: null,
			wrapT: null,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
		};

		this.variables.push(variable);

		return variable;
	};

	this.setVariableDependencies = function (variable, dependencies) {
		variable.dependencies = dependencies;
	};

	this.init = function () {
		if (renderer.capabilities.isWebGL2 === false && renderer.extensions.has('OES_texture_float') === false) {
			return 'No OES_texture_float support for float textures.';
		}

		if (renderer.capabilities.maxVertexTextures === 0) {
			return 'No support for vertex shader textures.';
		}

		const configRef = {};
		for (let i = 0; i < this.variables.length; i++) {
			const variable = this.variables[i];

			configRef[variable.name] = ref(null);

			// Creates rendertargets and initialize them with input texture
			variable.renderTargets[0] = this.createRenderTarget(
				sizeX,
				sizeY,
				variable.wrapS,
				variable.wrapT,
				variable.minFilter,
				variable.magFilter
			);
			variable.renderTargets[1] = this.createRenderTarget(
				sizeX,
				sizeY,
				variable.wrapS,
				variable.wrapT,
				variable.minFilter,
				variable.magFilter
			);
			this.renderTexture(variable.initialValueTexture, variable.renderTargets[0]);
			this.renderTexture(variable.initialValueTexture, variable.renderTargets[1]);

			// Adds dependencies uniforms to the ShaderMaterial
			var material = variable.material;
			var uniforms = material.uniforms;

			if (variable.dependencies !== null) {
				for (var d = 0; d < variable.dependencies.length; d++) {
					var depVar = variable.dependencies[d];

					if (depVar.name !== variable.name) {
						// Checks if variable exists
						var found = false;
						for (var j = 0; j < this.variables.length; j++) {
							if (depVar.name === this.variables[j].name) {
								found = true;
								break;
							}
						}

						if (!found) {
							console.warn(
								'Variable dependency not found. Variable=' +
									variable.name +
									', dependency=' +
									depVar.name
							);
							return;
						}
					}

					uniforms[depVar.name] = {value: null};

					// material.fragmentShader = '\nuniform sampler2D ' + depVar.name + ';\n' + material.fragmentShader;
				}
			}
		}

		this.currentTextureIndex = 0;

		return configRef;
	};

	this.compute = function (configRef) {
		var currentTextureIndex = this.currentTextureIndex;
		var nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

		for (var i = 0, il = this.variables.length; i < il; i++) {
			var variable = this.variables[i];

			// Sets texture dependencies uniforms
			if (variable.dependencies !== null) {
				var uniforms = variable.material.uniforms;
				for (var d = 0, dl = variable.dependencies.length; d < dl; d++) {
					var depVar = variable.dependencies[d];

					uniforms[depVar.name].value = depVar.renderTargets[currentTextureIndex].texture;
				}
			}

			// Performs the computation for this variable
			const renderTarget = variable.renderTargets[nextTextureIndex];
			this.doRenderTarget(variable.material, renderTarget);
			if (configRef[variable.name]) {
				configRef[variable.name].value = renderTarget.texture;
			} // else {
			//	console.log('variable not found', variable.name);
			//}
		}

		this.currentTextureIndex = nextTextureIndex;
	};

	this.getCurrentRenderTarget = function (variable) {
		return variable.renderTargets[this.currentTextureIndex];
	};

	this.getAlternateRenderTarget = function (variable) {
		return variable.renderTargets[this.currentTextureIndex === 0 ? 1 : 0];
	};

	function addResolutionDefine(materialShader) {
		materialShader.defines.resolution = 'vec2( ' + sizeX.toFixed(1) + ', ' + sizeY.toFixed(1) + ' )';
	}

	this.addResolutionDefine = addResolutionDefine;

	// The following functions can be used to compute things manually

	function createShaderMaterial(computeFragmentShader, uniforms) {
		uniforms = uniforms || {};

		var material = new ShaderMaterial({
			uniforms: uniforms,
			vertexShader: getPassThroughVertexShader(),
			fragmentShader: computeFragmentShader,
		});

		addResolutionDefine(material);

		return material;
	}

	this.createShaderMaterial = createShaderMaterial;

	this.createRenderTarget = function (sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter) {
		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		wrapS = wrapS || ClampToEdgeWrapping;
		wrapT = wrapT || ClampToEdgeWrapping;

		minFilter = minFilter || NearestFilter;
		magFilter = magFilter || NearestFilter;

		var renderTarget = new WebGLRenderTarget(sizeXTexture, sizeYTexture, {
			wrapS: wrapS,
			wrapT: wrapT,
			minFilter: minFilter,
			magFilter: magFilter,
			format: RGBAFormat,
			type: dataType,
			depthBuffer: false,
		});

		return renderTarget;
	};

	this.createTexture = function () {
		var data = new Float32Array(sizeX * sizeY * 4);
		return new DataTexture(data, sizeX, sizeY, RGBAFormat, FloatType);
	};

	this.renderTexture = function (input, output) {
		// Takes a texture, and render out in rendertarget
		// input = Texture
		// output = RenderTarget

		passThruUniforms.passThruTexture.value = input;

		this.doRenderTarget(passThruShader, output);

		passThruUniforms.passThruTexture.value = null;
	};

	this.doRenderTarget = function (material, output) {
		var currentRenderTarget = renderer.getRenderTarget();

		mesh.material = material;
		renderer.setRenderTarget(output);
		renderer.render(scene, camera);
		mesh.material = passThruShader;

		renderer.setRenderTarget(currentRenderTarget);
	};

	// Shaders

	function getPassThroughVertexShader() {
		return 'void main()	{\n' + '\n' + '	gl_Position = vec4( position, 1.0 );\n' + '\n' + '}\n';
	}

	function getPassThroughFragmentShader() {
		return (
			'uniform sampler2D passThruTexture;\n' +
			'\n' +
			'void main() {\n' +
			'\n' +
			'	vec2 uv = gl_FragCoord.xy / resolution.xy;\n' +
			'\n' +
			'	gl_FragColor = texture2D( passThruTexture, uv );\n' +
			'\n' +
			'}\n'
		);
	}
};

export {GPUComputationRenderer};
