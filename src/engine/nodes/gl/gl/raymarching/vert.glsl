precision highp float;
precision highp int;

varying vec3 vPw;
varying mat4 vModelMatrix;
varying mat4 vInverseModelMatrix;
varying mat4 VViewMatrix;

#include <common>

// // for depth material
// varying vec2 vHighPrecisionZW;

void main()	{

	vModelMatrix = modelMatrix;
	vInverseModelMatrix = inverse(modelMatrix);
	VViewMatrix = viewMatrix;
	vPw = (modelMatrix * vec4( position, 1.0 )).xyz;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	// vHighPrecisionZW = gl_Position.zw;
}