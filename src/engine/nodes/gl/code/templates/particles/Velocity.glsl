#include <common>

// uniform sampler2D texture_position;
// uniform sampler2D texture_velocity;
// uniform sampler2D texture_acceleration;

// INSERT DEFINE

void main() {

	vec2 particleUV = (gl_FragCoord.xy / resolution.xy);
	// vec3 velocity = texture2D( texture_velocity, particleUV ).xyz;
	// vec3 acceleration = texture2D( texture_acceleration, particleUV ).xyz;
	// gl_FragColor.xyz = velocity + TIME_INCREMENT * acceleration;

	// INSERT BODY

}