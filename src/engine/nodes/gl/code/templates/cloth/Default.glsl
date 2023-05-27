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
uniform float time;
uniform float timeDelta;
uniform float viscosity;
uniform float spring;

// INSERT DEFINE

// *** ADD COMMON ***

void main() {

	vec2 particleUv = gl_FragCoord.xy / tSize.xy;

	vec3 original = texture2D( tOriginal, particleUv ).xyz;
	vec3 previous = ( texture2D( tPrevious0, particleUv ).xyz + texture2D( tPrevious1, particleUv ).xyz ) / 1024.0;
	vec3 position = ( texture2D( tPosition0, particleUv ).xyz + texture2D( tPosition1, particleUv ).xyz ) / 1024.0;
	vec3 viscositySpring = texture2D( tViscositySpring, particleUv ).xyz;
	float viscosityMult = viscosity * viscositySpring.x;
	float springMult = spring * viscositySpring.y;
	float lipsMult = viscositySpring.z;

	// position.y += lipsMult * 1.*sin(-50.*time+50.*original.x) * timeDelta;
	// INSERT BODY

	vec3 offset = ( original - position ) * timeDelta * springMult;
	vec3 disp = ( position - previous ) * ( 1.0 - viscosityMult ) + position;

	gl_FragColor = vec4( unpackPosition( disp + offset, order ), 1.0 );

}
