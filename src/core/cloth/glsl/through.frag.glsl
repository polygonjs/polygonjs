precision highp float;
precision highp sampler2D;

uniform vec2 tSize;
uniform float order;
uniform sampler2D texture;

vec4 unpackPosition( vec4 pos ) {

	pos *= 1024.0;

	return ( order > 0.0 ) ? floor( pos ) : fract( pos );

}

void main() {

	vec2 uv = gl_FragCoord.xy / tSize.xy;

	gl_FragColor = unpackPosition( texture2D( texture, uv ) );

}
