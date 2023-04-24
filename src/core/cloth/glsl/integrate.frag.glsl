precision highp float;
precision highp sampler2D;

uniform vec2 tSize;
uniform float order;
uniform sampler2D tOriginal;
uniform sampler2D tPrevious0;
uniform sampler2D tPrevious1;
uniform sampler2D tPosition0;
uniform sampler2D tPosition1;
uniform sampler2D tViscositySpring;
uniform float timeDelta;
uniform float viscosity;
uniform float spring;

// #define dt2 0.000256

// *** ADD COMMON ***

void main() {

	vec2 uv = gl_FragCoord.xy / tSize.xy;

	vec3 org = texture2D( tOriginal, uv ).xyz;
	vec3 prv = ( texture2D( tPrevious0, uv ).xyz + texture2D( tPrevious1, uv ).xyz ) / 1024.0;
	vec3 pos = ( texture2D( tPosition0, uv ).xyz + texture2D( tPosition1, uv ).xyz ) / 1024.0;
	vec2 viscositySpring = texture2D( tViscositySpring, uv ).xy;
	float viscosityMult = viscosity * viscositySpring.x;
	float springMult = spring * viscositySpring.y;

	vec3 offset = ( org - pos ) * timeDelta * springMult;//18.5 * dt2 * 8.33333;
	vec3 disp = ( pos - prv ) * ( 1.0 - viscosityMult ) + pos;

	gl_FragColor = vec4( unpackPosition( disp + offset, order ), 1.0 );

}
