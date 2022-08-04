precision highp float;
precision highp int;

varying vec3 vPw;
varying mat4 Poly_modelMatrix;

#include <common>

void main()	{

	// start builder body code

	vPw = position;
	Poly_modelMatrix = modelMatrix;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}