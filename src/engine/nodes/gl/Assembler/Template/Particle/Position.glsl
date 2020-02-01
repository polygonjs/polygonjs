#include <common>

// uniform sampler2D texture_position;
// uniform sampler2D texture_velocity;

// INSERT DEFINE

void main() {

	vec2 particleUV = (gl_FragCoord.xy / resolution.xy);
	// vec3 position = texture2D( texture_position, particleUV ).xyz;
	// vec3 velocity = texture2D( texture_velocity, particleUV ).xyz;
	// gl_FragColor.xyz = position + TIME_INCREMENT * velocity;

	// INSERT BODY

}