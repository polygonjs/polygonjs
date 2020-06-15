uniform sampler2D map;
varying vec2 vUv;

void main() {

	vec2 sampleUV = vUv;
	vec4 color = texture2D( map, sampleUV, 0.0 );

	gl_FragColor = vec4( color.xyz, 1.0 );

}