precision highp float;
precision highp int;
varying vec3 vPw;
#include <common>
const int _MAT_RAYMARCHINGBUILDER1_SDFMATERIAL1 = 147;
uniform float time;
uniform sampler2D v_POLY_texture_envTexture1;
void main()	{
	vPw = (modelMatrix * vec4( position, 1.0 )).xyz;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}