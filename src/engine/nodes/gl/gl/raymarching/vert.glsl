precision highp float;
precision highp int;

varying vec3 vPw;

#include <common>

void main()	{

	vPw = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}