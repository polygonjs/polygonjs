#include <common>

// uniform sampler2D texture_position;
// uniform sampler2D texture_velocity;
// uniform sampler2D texture_acceleration;

// INSERT DEFINE

void main() {

	vec2 particleUv = (gl_FragCoord.xy / resolution.xy);
	// vec3 velocity = texture2D( texture_velocity, particleUv ).xyz;
	// vec3 acceleration = texture2D( texture_acceleration, particleUv ).xyz;
	// gl_FragColor.xyz = velocity + TIME_INCREMENT * acceleration;

	// INSERT BODY

}