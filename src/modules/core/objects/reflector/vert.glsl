uniform mat4 textureMatrix;
varying vec4 vUv;
varying vec3 vertexColor;
attribute vec3 color;

void main() {

	vUv = textureMatrix * vec4( position, 1.0 );
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	vertexColor = color;
}