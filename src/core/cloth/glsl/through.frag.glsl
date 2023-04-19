precision highp float;
precision highp sampler2D;

uniform vec2 tSize;
uniform float order;
uniform sampler2D texture;

// *** ADD COMMON ***

void main() {

	vec2 uv = gl_FragCoord.xy / tSize.xy;

	gl_FragColor = unpackPosition( texture2D( texture, uv ), order );

}
