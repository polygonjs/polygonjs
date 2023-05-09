precision highp float;

attribute vec2 position;

void main() {

	gl_Position = vec4( position, vec2(1.0) );

}
