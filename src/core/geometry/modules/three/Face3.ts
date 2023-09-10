/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
// adapted to class and typescript from Face.js in three.js revision 109

import {Color, Vector3} from 'three';

export class Face3 {
	constructor(
		public a: number,
		public b: number,
		public c: number,
		public normal?: Vector3,
		public color?: Color,
		public materialIndex?: number
	) {}

	// clone(){}
}

// function Face3( a, b, c, normal, color, materialIndex ) {

// 	this.a = a;
// 	this.b = b;
// 	this.c = c;

// 	this.normal = ( normal && normal.isVector3 ) ? normal : new Vector3();
// 	this.vertexNormals = Array.isArray( normal ) ? normal : [];

// 	this.color = ( color && color.isColor ) ? color : new Color();
// 	this.vertexColors = Array.isArray( color ) ? color : [];

// 	this.materialIndex = materialIndex !== undefined ? materialIndex : 0;

// }

// // Object.assign( Face3.prototype, {

// // 	clone: function () {

// // 		return new this.constructor().copy( this );

// // 	},

// // 	copy: function ( source ) {

// // 		this.a = source.a;
// // 		this.b = source.b;
// // 		this.c = source.c;

// // 		this.normal.copy( source.normal );
// // 		this.color.copy( source.color );

// // 		this.materialIndex = source.materialIndex;

// // 		for ( var i = 0, il = source.vertexNormals.length; i < il; i ++ ) {

// // 			this.vertexNormals[ i ] = source.vertexNormals[ i ].clone();

// // 		}

// // 		for ( var i = 0, il = source.vertexColors.length; i < il; i ++ ) {

// // 			this.vertexColors[ i ] = source.vertexColors[ i ].clone();

// // 		}

// // 		return this;

// // 	}

// // } );

// // export { Face3 };
