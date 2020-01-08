uniform float offset;
uniform float darkness;
uniform sampler2D tDiffuse;
uniform sampler2D map;
varying vec2 vUv;

void main() {

	vec4 texel = texture2D( tDiffuse, vUv );
	vec4 map_val = texture2D( map, vUv );
	vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );
	// gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );
	gl_FragColor = vec4( mix( texel.rgb, map_val.rgb, map_val.a ), texel.a );

}
