// import {
// 	CanvasTexture,
// 	sRGBEncoding,
// 	// DataTexture,
// 	// FramebufferTexture,
// 	NearestFilter,
// 	// RGBAFormat,
// 	// Vector2,
// 	WebGLRenderer,
// 	// DataTexture,
// } from 'three';
// import {ExtendedXRWebGLBinding, ExtentedXRView, XRCamera} from './CommonAR';

// // function initCameraCaptureScene(gl: WebGLRenderingContext | WebGL2RenderingContext) {
// // 	var vertices = [-1.0, 1.0, 0.0];

// // 	const vertexBuffer = gl.createBuffer();
// // 	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// // 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
// // 	gl.bindBuffer(gl.ARRAY_BUFFER, null);

// // 	const vertCode =
// // 		'attribute vec3 coordinates;' +
// // 		'void main(void) {' +
// // 		'gl_Position = vec4(coordinates, 1.0);' +
// // 		'gl_PointSize = 1.0;' +
// // 		'}';
// // 	const vertShader = gl.createShader(gl.VERTEX_SHADER);
// // 	if (!vertShader) {
// // 		return;
// // 	}
// // 	gl.shaderSource(vertShader, vertCode);
// // 	gl.compileShader(vertShader);

// // 	// NOTE: we must explicitly use the camera texture in drawing,
// // 	// otherwise uSampler gets optimized away, and the
// // 	// camera texture gets destroyed before we could capture it.
// // 	const fragCode =
// // 		'uniform sampler2D uSamples;' + 'void main(void) {' + 'gl_FragColor = texture2D(uSamples, vec2(0,0));' + '}';
// // 	const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
// // 	if (!fragShader) {
// // 		return;
// // 	}
// // 	gl.shaderSource(fragShader, fragCode);
// // 	gl.compileShader(fragShader);

// // 	const shaderProgram = gl.createProgram();
// // 	if (!shaderProgram) {
// // 		return;
// // 	}
// // 	gl.attachShader(shaderProgram, vertShader);
// // 	gl.attachShader(shaderProgram, fragShader);
// // 	gl.linkProgram(shaderProgram);

// // 	const aCoordLoc = gl.getAttribLocation(shaderProgram, 'coordinates');
// // 	const uSamplerLoc = gl.getUniformLocation(shaderProgram, 'uSamples');
// // 	const uSamplerLocs = gl.getUniformLocation(shaderProgram, 'uSampler');

// // 	let glError = gl.getError();
// // 	if (glError != gl.NO_ERROR) {
// // 		console.log('GL error: ' + glError);
// // 	}

// // 	return {shaderProgram, vertexBuffer, aCoordLoc, uSamplerLoc, uSamplerLocs};
// // }

// // function drawCameraCaptureScene(
// // 	gl: WebGLRenderingContext | WebGL2RenderingContext,
// // 	cameraTexture: WebGLTexture,
// // 	width: number,
// // 	height: number
// // ) {
// // 	const prevShaderId = gl.getParameter(gl.CURRENT_PROGRAM);

// // 	const initData = initCameraCaptureScene(gl);
// // 	if (!initData) {
// // 		return;
// // 	}
// // 	const {shaderProgram, vertexBuffer, aCoordLoc, uSamplerLoc, uSamplerLocs} = initData;

// // 	gl.useProgram(shaderProgram);

// // 	// Bind the geometry
// // 	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// // 	gl.vertexAttribPointer(aCoordLoc, 3, gl.FLOAT, false, 0, 0);
// // 	gl.enableVertexAttribArray(aCoordLoc);

// // 	// Bind the texture to
// // 	gl.activeTexture(gl.TEXTURE1);
// // 	gl.bindTexture(gl.TEXTURE_2D, cameraTexture);
// // 	gl.uniform1i(uSamplerLoc, 1);

// // 	// Draw the single point
// // 	gl.drawArrays(gl.POINTS, 0, 1);

// // 	const prev_framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING); // save the screen framebuffer ID

// // 	// Create a framebuffer backed by the texture
// // 	const framebuffer = gl.createFramebuffer();
// // 	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
// // 	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cameraTexture, 0);

// // 	// Read the contents of the framebuffer
// // 	const data = new Uint8Array(width * height * 4);
// // 	gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
// // 	gl.deleteFramebuffer(framebuffer);

// // 	gl.bindFramebuffer(gl.FRAMEBUFFER, prev_framebuffer); // bind back the screen framebuffer

// // 	const texture1 = gl.createTexture();
// // 	gl.activeTexture(gl.TEXTURE0);
// // 	gl.bindTexture(gl.TEXTURE_2D, texture1);
// // 	gl.uniform1i(uSamplerLocs, 0);
// // 	const level = 1;
// // 	const internalFormat = gl.RGBA;
// // 	const border = 0;
// // 	const srcFormat = gl.RGBA;
// // 	const srcType = gl.UNSIGNED_BYTE;
// // 	const pixel = data;
// // 	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

// // 	gl.useProgram(prevShaderId);

// // 	return data;
// // }
// // const canvas = document.createElement('canvas');
// // canvas.width = 100;
// // canvas.height = 100;
// // canvas.id = 'debug';
// // document.body.append(canvas);
// // const ctx = canvas.getContext('2d');
// // if (ctx) {
// // 	ctx.fillStyle = '#FF0000';
// // 	ctx.fillRect(0, 0, 150, 75);
// // }

// function initFrameBuffer(gl: WebGLRenderingContext | WebGL2RenderingContext, texture: WebGLTexture) {
// 	const frameBuffer = gl.createFramebuffer();
// 	console.log('create frameBuffer');

// 	// make this the current frame buffer
// 	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

// 	// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
// 	// attach the texture to the framebuffer.
// 	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

// 	// check if you can read from this type of texture.
// 	const readAllowed = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;

// 	// Unbind the framebuffer
// 	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

// 	return {frameBuffer, readAllowed};
// }
// function readWebGLTexture(
// 	renderer: WebGLRenderer,
// 	frameBuffer: WebGLFramebuffer,
// 	gl: WebGLRenderingContext | WebGL2RenderingContext,
// 	canvasContext: CanvasRenderingContext2D,
// 	canvasTexture: CanvasTexture,
// 	// texture: WebGLTexture,
// 	imageData: ImageData,
// 	w: number,
// 	h: number
// ) {
// 	// const start = performance.now();
// 	// const renderTarget = renderer.getRenderTarget();
// 	// const previousBuffer: WebGLFramebuffer | null = renderer.properties.get(renderTarget).__webglFramebuffer;
// 	// gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
// 	// renderer.state.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
// 	// const t1 = performance.now() - start;
// 	// gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, imageData.data);
// 	// const t2 = performance.now() - start;
// 	// canvasContext.putImageData(imageData, 0, 0);
// 	// const t3 = performance.now() - start;
// 	// canvasContext.drawImage(gl.canvas, 0, 0, w, h);
// 	// canvasTexture.needsUpdate = true;
// 	// renderer.state.bindFramebuffer(gl.FRAMEBUFFER, previousBuffer);
// 	// console.log(t1, t2, t3);
// 	// gl.enable(gl.SCISSOR_TEST);
// 	// for (var y = 0; y < 15; ++y) {
// 	// 	var v = y / 14;
// 	// 	// gl.scissor(0, y * 10, 300, 10);
// 	// 	gl.clearColor(v, 0, 1 - v, 1);
// 	// 	gl.clear(gl.COLOR_BUFFER_BIT);
// 	// }
// 	// canvasContext.drawImage(gl.canvas, 0, 0, w, h);
// }

// // function readWebGLTexture(
// // 	renderer: WebGLRenderer,
// // 	frameBuffer: WebGLFramebuffer,
// // 	gl: WebGLRenderingContext | WebGL2RenderingContext,
// // 	canvasContext: CanvasRenderingContext2D,
// // 	canvasTexture: CanvasTexture,
// // 	webGLTexture: WebGLTexture,
// // 	imageData: ImageData,
// // 	w: number,
// // 	h: number
// // ) {
// // 	const texture1 = drawCameraCaptureScene(gl, webGLTexture, w, h);
// // 	if (!texture1) {
// // 		console.log('no data');
// // 		return;
// // 	}
// // 	const size = w * h;
// // 	for (var i = 0; i < size; i++) {
// // 		imageData.data[i] = texture1[i];
// // 		// if (this.pixels[i] > 0) {
// // 		// 	countAbove0++;
// // 		// }
// // 	}
// // 	// const imageData = new ImageData(w,h)
// // 	canvasContext.putImageData(imageData, 0, 0);
// // 	// if (texture1) {
// // 	// 	console.log('->', texture1[0]);
// // 	// }
// // }

// //
// // https://stackoverflow.com/questions/13626606/read-pixels-from-a-webgl-texture
// // https://discourse.threejs.org/t/solved-extract-pixels-data-from-datatexture/6339
// // https://stackoverflow.com/questions/8191083/can-one-easily-create-an-html-image-element-from-a-webgl-texture-object
// //
// export class CoreWebXRARCaptureController {
// 	protected _localReferenceSpace: XRReferenceSpace | XRBoundedReferenceSpace | undefined;
// 	protected _captureNext: boolean = false;
// 	protected _captureGlBinding: ExtendedXRWebGLBinding | undefined;
// 	protected _glContext: WebGLRenderingContext | WebGL2RenderingContext | undefined;
// 	protected cameraWebGLTexture: WebGLTexture | undefined;
// 	protected frameBuffer: WebGLFramebuffer | undefined;
// 	// private _dataTexture: DataTexture | undefined;
// 	// protected _frameBufferTexture: FramebufferTexture | undefined;
// 	// private _frameBufferPos = new Vector2(0, 0);
// 	// private _dataTexture: DataTexture | undefined;
// 	protected _canvas: HTMLCanvasElement | undefined;
// 	protected _canvasTexture: CanvasTexture | undefined;
// 	protected _canvasContext: CanvasRenderingContext2D | undefined;
// 	protected _imageData: ImageData | undefined;
// 	protected w: number | undefined;
// 	protected h: number | undefined;
// 	protected size: number | undefined;
// 	// protected magicArray: Uint8Array | undefined;
// 	// protected dataTexture: DataTexture | undefined;
// 	// protected pixels: Uint8Array | undefined;
// 	// protected pixels2: Uint8Array | undefined;
// 	// private _bitmap: ImageBitmap | undefined;
// 	constructor(protected renderer: WebGLRenderer) {}

// 	// frameBufferTexture() {
// 	// 	return this._frameBufferTexture;
// 	// }
// 	texture() {
// 		return this._canvasTexture;
// 	}
// 	// canvasTexture() {
// 	// 	return this._canvasTexture;
// 	// }

// 	async init(session: XRSession) {
// 		this._glContext = this.renderer.getContext();
// 		await this._glContext.makeXRCompatible();
// 		// could lead to race condition
// 		// initCameraCaptureScene(gl);
// 		this._captureGlBinding = new XRWebGLBinding(session, this._glContext) as ExtendedXRWebGLBinding;
// 		session.requestReferenceSpace('local').then((refSpace) => {
// 			this._localReferenceSpace = refSpace;
// 		});
// 		this._captureNext = true;
// 		// setTimeout(() => {
// 		// 	console.log('set true');
// 		// 	this._captureNext = true;
// 		// }, 4000);
// 	}
// 	process(frame: XRFrame, referenceSpace: XRReferenceSpace) {
// 		// if (1 + 1) {
// 		// 	return;
// 		// }
// 		// if (1 + 1) return;
// 		// session.requestReferenceSpace('local').then((referenceSpace) => {
// 		// 	if (!session.requestHitTestSource) {
// 		// 		return;
// 		// 	}
// 		// 	session.requestHitTestSource({space: referenceSpace})?.then((source) => {
// 		// 		this.hitTestSource = source;
// 		// 	});
// 		// });
// 		// session.requestReferenceSpace("local").then((refSpace) => {
// 		// 	this._captureLocalReferenceSpace = refSpace;
// 		//   });
// 		// if (this._frameBufferTexture && this._canvasTexture) {
// 		// 	// this.renderer.copyTextureToTexture(this._frameBufferPos, this._frameBufferTexture, this._canvasTexture);
// 		// }

// 		// const renderTarget = this.renderer.getRenderTarget();
// 		// if (renderTarget) {
// 		// 	this.renderer.readRenderTargetPixels(renderTarget, 0, 0, 1, 1, this.pixels2);
// 		// 	console.log(this.pixels2?.buffer, this.pixels2);
// 		// } else {
// 		// 	console.log('no renderTarget');
// 		// }
// 		// if (
// 		// 	!(this._glContext && this.pixels)){
// 		// 		return
// 		// 	}
// 		// 	const gl = this._glContext;
// 		// if (this.magicArray) {
// 		// 	console.log(this.magicArray[0]);
// 		// }

// 		if (
// 			this.frameBuffer &&
// 			this._glContext &&
// 			this.cameraWebGLTexture &&
// 			this._canvasContext &&
// 			this._imageData &&
// 			this.w &&
// 			this.h &&
// 			this.size &&
// 			// this.pixels &&
// 			this._canvasTexture
// 		) {
// 			// this._canvasContext.drawImage(this._bitmap, 0, 0);
// 			// this.renderer.readRenderTargetPixels()
// 			// this._glContext.readPixels(
// 			// 	0,
// 			// 	0,
// 			// 	this.w,
// 			// 	this.h,
// 			// 	this._glContext.RGBA,
// 			// 	this._glContext.UNSIGNED_BYTE,
// 			// 	this.pixels
// 			// );
// 			// this.renderer.copyFramebufferToTexture(this._frameBufferPos, this._dataTexture);
// 			// this.renderer.copyTextureToTexture(this._frameBufferPos, this._frameBufferTexture, this._dataTexture);
// 			// const imageData = this._dataTexture.source.data;
// 			// const {data, width, height} = imageData;
// 			// console.log('draw');
// 			readWebGLTexture(
// 				this.renderer,
// 				this.frameBuffer,
// 				this._glContext,
// 				this._canvasContext,
// 				this._canvasTexture,
// 				// this.cameraWebGLTexture,
// 				this._imageData,
// 				this.w,
// 				this.h
// 			);
// 			// const size = this.size;
// 			// let countAbove0 = 0;
// 			// for (var i = 0; i < size; i++) {
// 			// 	this._imageData.data[i] = this.pixels[i];
// 			// 	// if (this.pixels[i] > 0) {
// 			// 	// 	countAbove0++;
// 			// 	// }
// 			// }
// 			// if (countAbove0 > 0) {
// 			// 	console.log({countAbove0});
// 			// }
// 			// console.log(this._imageData.data[0]);
// 		} else {
// 			// console.log('not ready', {
// 			// 	fb: this.frameBuffer,
// 			// 	gl: this._glContext,
// 			// 	camText: this.cameraWebGLTexture,
// 			// 	ctx: this._canvasContext,
// 			// 	id: this._imageData,
// 			// 	w: this.w,
// 			// 	h: this.h,
// 			// 	sizw: this.size,
// 			// 	// pixels:this.pixels,
// 			// 	ct: this._canvasTexture,
// 			// });
// 		}
// 		if (!(this._localReferenceSpace && this._captureGlBinding && this._glContext)) {
// 			return;
// 		}
// 		const pose = frame.getViewerPose(this._localReferenceSpace);
// 		if (!pose) {
// 			return;
// 		}
// 		// frame.session.renderState.baseLayer?.framebuffer
// 		// const baseLayer = frame.session.renderState.baseLayer;
// 		// if (!baseLayer) {
// 		// 	return;
// 		// }
// 		const views = pose.views as ExtentedXRView[];
// 		let dcamera: XRCamera | undefined;
// 		for (const view of views) {
// 			// const viewport = baseLayer.getViewport(view);
// 			// if (viewport) {
// 			// 	this._glContext.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
// 			// }
// 			if (view.camera && this._captureNext) {
// 				this._captureNext = false;
// 				dcamera = view.camera;
// 				const cameraWebGLTexture = this._captureGlBinding.getCameraImage(dcamera);
// 				if (!cameraWebGLTexture) {
// 					console.log('no texture');
// 					return;
// 				}
// 				// console.log(
// 				// 	'new text',
// 				// 	this.cameraWebGLTexture,
// 				// 	cameraWebGLTexture,
// 				// 	this.cameraWebGLTexture === cameraWebGLTexture
// 				// );
// 				this.cameraWebGLTexture = cameraWebGLTexture;
// 				(window as any).cameraWebGLTexture = cameraWebGLTexture;
// 				console.log('cameraWebGLTexture', cameraWebGLTexture);
// 				const {frameBuffer, readAllowed} = initFrameBuffer(this._glContext, this.cameraWebGLTexture);
// 				if (!readAllowed) {
// 					console.log('readnot allowed');
// 				}
// 				if (!frameBuffer) {
// 					console.log('no frameBuffer');
// 					return;
// 				}
// 				this.frameBuffer = frameBuffer;
// 				// console.log('buffer', this.frameBuffer);
// 				console.log('buffer', this.frameBuffer, this.cameraWebGLTexture);
// 				if (this._canvas) {
// 					// console.log('canvas already created');
// 					return;
// 				}
// 				const w = dcamera.width;
// 				const h = dcamera.height;
// 				this.w = w;
// 				this.h = h;
// 				// console.log(camBinding);

// 				// this._frameBufferTexture = new FramebufferTexture(w, h, RGBAFormat);
// 				// this._frameBufferTexture.minFilter = NearestFilter;
// 				// this._frameBufferTexture.magFilter = NearestFilter;
// 				this.size = w * h * 4;
// 				// this.pixels = new Uint8Array(this.size);
// 				// this.pixels2 = new Uint8Array(4);

// 				// this._dataTexture = new DataTexture(this.pixels, w, h, RGBAFormat);
// 				this._canvas = document.createElement('canvas');
// 				this._canvas.width = w;
// 				this._canvas.height = h;
// 				document.body.append(this._canvas);
// 				this._canvas.style.position = 'absolute';
// 				this._canvas.style.bottom = '0px';
// 				this._canvas.style.left = '0px';
// 				this._canvas.style.transform = 'scale(0.5)';
// 				this._canvas.style.zIndex = '9999999999999999999';
// 				const context = this._canvas.getContext('2d');
// 				if (!context) {
// 					return;
// 				}
// 				this._canvasContext = context;
// 				this._canvasTexture = new CanvasTexture(this._canvas);
// 				this._canvasTexture.encoding = sRGBEncoding;
// 				this._canvasTexture.minFilter = NearestFilter;
// 				this._canvasTexture.magFilter = NearestFilter;
// 				this._canvasTexture.flipY = true;
// 				console.log('texture created', this._canvasTexture);
// 				// console.log('textures created', this.renderer.getSize(new Vector2()));

// 				// context.drawImage(this.renderer.domElement, 0, 0);
// 				// this.renderer.readRenderTargetPixels(this._frameBufferPos, )
// 				// createImageBitmap(camBinding)
// 				// var gl = webglRenderer.context;

// 				// https://discourse.threejs.org/t/solved-extract-pixels-data-from-datatexture/6339/2

// 				this._imageData = new ImageData(w, h);

// 				// this.magicArray = drawCameraCaptureScene(
// 				// 	this._glContext,
// 				// 	this.cameraWebGLTexture,
// 				// 	dcamera.width,
// 				// 	dcamera.height
// 				// );
// 				// if (this.magicArray) {
// 				// 	console.log(this.magicArray[0]);
// 				// }
// 				// this.dataTexture = new DataTexture(this.magicArray, dcamera.width, dcamera.height);

// 				// readWebGLTexture(
// 				// 	this.renderer,
// 				// 	this.frameBuffer,
// 				// 	this._glContext,
// 				// 	this._canvasContext,
// 				// 	this._canvasTexture,
// 				// 	// this.cameraWebGLTexture,
// 				// 	this._imageData,
// 				// 	this.w,
// 				// 	this.h
// 				// );
// 				// this._glContext.readPixels(0, 0, w, h, this._glContext.RGBA, this._glContext.UNSIGNED_BYTE, pixels);
// 				// console.log(pixels); // Uint8Array
// 				// toImageData(pixels, dcamera.width, dcamera.height).then((bitmap) => {
// 				// 	this._bitmap = bitmap;
// 				// 	//draw image to canvas
// 				// 	this._canvas = document.createElement('canvas');
// 				// 	document.body.append(this._canvas);
// 				// 	this._canvas.width = bitmap.width;
// 				// 	this._canvas.height = bitmap.height;
// 				// 	if (1 + 1) {
// 				// 		return;
// 				// 	}
// 				// this.renderer.xr.getBaseLayer()
// 				// this.renderer.xr.getBinding()

// 				// 	const context = this._canvas.getContext('2d');
// 				// 	if (!context) {
// 				// 		return;
// 				// 	}
// 				// 	this._canvasContext = context;
// 				// 	// console.log('draw');
// 				// 	// this._canvasContext.drawImage(this._bitmap, 0, 0);
// 				// 	//extract image from canvas
// 				// 	// const img = new Image();
// 				// 	// img.src = canvas.toDataURL();
// 				// 	// document.body.appendChild(img);
// 				// });
// 				// function toImageData(pixels: Uint8Array, w: number, h: number) {
// 				// 	//copy texture data to Image data where format is RGBA
// 				// 	let countAbove0 = 0;
// 				// 	for (var i = 0; i < size; i++) {
// 				// 		image.data[i] = pixels[i];
// 				// 		if (pixels[i] > 0) {
// 				// 			countAbove0++;
// 				// 		}
// 				// 	}
// 				// 	console.log({countAbove0});
// 				// 	const bitmap = createImageBitmap(image);
// 				// 	return bitmap;
// 				// }

// 				// this.renderer.copyTextureToTexture(
// 				// 	this._frameBufferPos,
// 				// 	this._frameBufferTexture,
// 				// 	this._canvasTexture
// 				// );

// 				// this._dataTexture = new DataTexture(texture1, dcamera.width, dcamera.height);
// 				// console.log(this._dataTexture);

// 				// whratio = viewport.width / viewport.height;
// 				// scaleGeo = 2 * Math.tan((2 * Math.PI * camera.fov) / (2 * 360));
// 				// const geometry = new THREE.PlaneGeometry(
// 				//   scaleGeo,
// 				//   scaleGeo * whratio,
// 				//   1,
// 				//   1
// 				// );
// 				// const vertices = geometry.attributes.position.array;

// 				// const mesh = new THREE.Mesh(geometry, new THREE.ShaderMaterial());
// 				// mesh.material = new THREE.ShaderMaterial({
// 				//   uniforms: {
// 				//     uSampler: {
// 				//       value: new THREE.DataTexture(
// 				//         texture1,
// 				//         dcamera.width,
// 				//         dcamera.height
// 				//       )
// 				//     },
// 				//     coordTrans: {
// 				//       value: {
// 				//         x: 1 / viewport.width,
// 				//         y: 1 / viewport.height
// 				//       }
// 				//     }
// 				//   },
// 				//   vertexShader: document.getElementById("vertexShader").textContent,
// 				//   fragmentShader: document.getElementById("fragmentShader").textContent
// 				// });

// 				// mesh.quaternion.copy(camera.quaternion);
// 				// mesh.position.copy(camera.position);
// 				// mesh.position.add(
// 				//   new THREE.Vector3(0, 0, -0.4).applyQuaternion(camera.quaternion)
// 				// );
// 				// mesh.rotateZ((3 * Math.PI) / 2);
// 				// // mesh.material.wireframe = true
// 				// scene.add(mesh);
// 			} else {
// 				// console.log('unavailable');
// 			}
// 			// }
// 		}
// 	}
// }
