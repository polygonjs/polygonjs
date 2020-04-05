// import {Vector4} from 'three/src/math/Vector4';
// import {Vector2} from 'three/src/math/Vector2';
// import {ShaderMaterial} from 'three/src/materials/ShaderMaterial';
// import {PlaneBufferGeometry} from 'three/src/geometries/PlaneGeometry';
// import {Mesh} from 'three/src/objects/Mesh';
// import {Texture} from 'three/src/textures/Texture';

// import defaultVertexShader from './ScreenQuad/vertex.glsl';
// import defaultFragmentShader from './ScreenQuad/fragment.glsl';

// const defaultQuad = new PlaneBufferGeometry(2, 2, 1, 1);

// interface ScreenQuadParams {
// 	debug?: boolean;
// 	texture?: Texture;
// 	fragmentShader?: string;
// 	width?: number;
// 	height?: number;
// 	// pairs
// 	top?: number;
// 	bottom?: number;
// 	left?: number;
// 	right?: number;
// }
// type SideName = 'top' | 'bottom' | 'left' | 'right';
// type Pair = [SideName, SideName];

// interface ScreenQuadMesh extends Mesh {
// 	_debug: boolean;
// 	_pixels: [boolean, boolean, boolean, boolean, boolean, boolean];
// 	_pairs: {
// 		topBottom: Pair;
// 		leftRight: Pair;
// 	};
// }

// export const ScreenQuad = function ScreenQuad(this: any, params: ScreenQuadParams) {
// 	params = params || {};

// 	var debug = undefined !== params.debug ? params.debug : false;

// 	const self = (<unknown>this) as ScreenQuadMesh;
// 	Mesh.apply(self, [
// 		defaultQuad,
// 		new ShaderMaterial({
// 			uniforms: {
// 				uTexture: {
// 					type: 't',
// 					value: undefined !== params.texture ? params.texture : null,
// 				},
// 				uSize: {
// 					type: 'v4',
// 					value: new Vector4(1, 1, 0, 0),
// 				},
// 				uSide: {
// 					type: 'v2',
// 					value: new Vector2(1, 1),
// 				},
// 			},

// 			vertexShader: defaultVertexShader,

// 			fragmentShader: params.fragmentShader ? params.fragmentShader : defaultFragmentShader,

// 			depthWrite: false,

// 			defines: {debug: debug},
// 		}),
// 	]);

// 	self.frustumCulled = false;

// 	self.renderOrder = -1;

// 	//end mesh setup

// 	self._debug = debug;

// 	self._pixels = [false, false, false, false, false, false]; //w h t l b r

// 	self._pairs = {
// 		topBottom: ['top', 'bottom'],
// 		leftRight: ['left', 'right'],
// 	};

// 	//resolve the pairs
// 	for (var p in this._pairs) this._initPair(params, this._pairs[p]);

// 	/*this.top = undefined !== params.top ? params.top : 0;

// 	this.left = undefined !== params.left ? params.left : 0;

// 	this.bottom = undefined !== params.bottom ? params.bottom : false;

// 	this.right = undefined !== params.right ? params.right : false;*/

// 	this.width = undefined !== params.width ? params.width : 1;

// 	this.height = undefined !== params.height ? params.height : 1;

// 	//cleanup
// 	this._componentSetters = [this.setWidth, this.setHeight, this.setTop, this.setLeft, this.setBottom, this.setRight];

// 	this._components = ['width', 'height', 'top', 'left', 'bottom', 'right'];

// 	// console.log( this , this.width , this.height );

// 	this.screenSize = new Vector2(1, 1);

// 	this.setSize(this.width, this.height);

// 	if (this.top !== null) this.setTop(this.top);
// 	else this.setBottom(this.bottom);

// 	if (this.left !== null) this.setLeft(this.left);
// 	else this.setRight(this.right);
// };

// ScreenQuad.prototype = Object.create(Mesh.prototype);

// ScreenQuad.constructor = ScreenQuad;

// ScreenQuad.prototype._initPair = function(params: ScreenQuadParams, pair: Pair) {
// 	if (undefined !== params[pair[0]] || undefined !== params[pair[1]]) {
// 		this[pair[0]] = undefined === params[pair[0]] ? null : params[pair[0]]; //top was provided, write top, | not provided but bottom was write null

// 		this[pair[1]] = this[pair[0]] !== null ? null : params[pair[1]]; //top is not null top takes precedence
// 	} else {
// 		this[pair[0]] = 0;

// 		this[pair[1]] = null;
// 	}
// };

// // ScreenQuad.prototype.setScreenSize = function( width , height ){

// // 	this.screenSize.set( width , height );

// // 	var that = this;

// // 	this._pixels.forEach( function(p,pi){

// // 		//if a component is set in pixels, update the uniform
// // 		if ( p ) that._componentSetters[ pi ].call(that , that[ that._components[pi] ] );

// // 	});

// // }
// ScreenQuad.prototype.setSize = function(width: number, height: number) {
// 	this.setWidth(width);

// 	this.setHeight(height);
// };

// ScreenQuad.prototype.setWidth = function(v: number) {
// 	this.width = v;

// 	if (isNaN(v)) {
// 		this.material.uniforms.uSize.value.x = Math.round(v) / this.screenSize.x;

// 		this._pixels[0] = true;
// 	} else {
// 		this.material.uniforms.uSize.value.x = v;

// 		this._pixels[0] = false;
// 	}
// };

// ScreenQuad.prototype.setHeight = function(v: number) {
// 	this.height = v;

// 	if (isNaN(v)) {
// 		this.material.uniforms.uSize.value.y = Math.round(v) / this.screenSize.y;

// 		this._pixels[1] = true;
// 	} else {
// 		this.material.uniforms.uSize.value.y = v;

// 		this._pixels[1] = false;
// 	}
// };

// ScreenQuad.prototype.setTop = function(v: number) {
// 	if (null === v) {
// 		return; //hack for navigation, the loop up calls these
// 	}
// 	this.top = v;

// 	this.bottom = null; //clean this up make one function and structure

// 	this.material.uniforms.uSide.value.y = 1;

// 	if (isNaN(v)) {
// 		//if its not a number

// 		this.material.uniforms.uSize.value.z = Math.round(v) / this.screenSize.y; //pixels to percentage

// 		this._pixels[2] = true; //this value is in pixels
// 	} else {
// 		this.material.uniforms.uSize.value.z = v; //just percentage uniform

// 		this._pixels[2] = false; //this value is not in pixels
// 	}
// };

// ScreenQuad.prototype.setLeft = function(v: number) {
// 	if (null === v) return;

// 	this.left = v;

// 	this.right = null;

// 	this.material.uniforms.uSide.value.x = -1;

// 	if (isNaN(v)) {
// 		this.material.uniforms.uSize.value.w = Math.round(v) / this.screenSize.x;

// 		this._pixels[3] = true;
// 	} else {
// 		this.material.uniforms.uSize.value.w = v;

// 		this._pixels[3] = false;
// 	}
// };

// ScreenQuad.prototype.setBottom = function(v: number) {
// 	if (null === v) return;

// 	this.bottom = v;

// 	this.top = null;

// 	this.material.uniforms.uSide.value.y = -1;

// 	if (isNaN(v)) {
// 		this.material.uniforms.uSize.value.z = Math.round(v) / this.screenSize.y;

// 		this._pixels[4] = true;
// 	} else {
// 		this.material.uniforms.uSize.value.z = v;

// 		this._pixels[4] = false;
// 	}
// };

// ScreenQuad.prototype.setRight = function(v: number) {
// 	if (null === v) return;

// 	this.right = v;

// 	this.left = null;

// 	this.material.uniforms.uSide.value.x = 1;

// 	if (isNaN(v)) {
// 		this.material.uniforms.uSize.value.w = Math.round(v) / this.screenSize.x;

// 		this._pixels[5] = true;
// 	} else {
// 		this.material.uniforms.uSize.value.w = v;

// 		this._pixels[5] = false;
// 	}
// };
