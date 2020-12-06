float compute_velocity_from_acceleration(float vel, float force, float mass, float time_delta){
	float impulse = (force * mass) * time_delta;
	return vel + impulse;
}
vec2 compute_velocity_from_acceleration(vec2 vel, vec2 force, float mass, float time_delta){
	vec2 impulse = (force * mass) * time_delta;
	return vel + impulse;
}
vec3 compute_velocity_from_acceleration(vec3 vel, vec3 force, float mass, float time_delta){
	vec3 impulse = (force * mass) * time_delta;
	return vel + impulse;
}
vec4 compute_velocity_from_acceleration(vec4 vel, vec4 force, float mass, float time_delta){
	vec4 impulse = (force * mass) * time_delta;
	return vel + impulse;
}
float compute_position_from_velocity(float position, float velocity, float time_delta){
	return position + (velocity * time_delta);
}
vec2 compute_position_from_velocity(vec2 position, vec2 velocity, float time_delta){
	return position + (velocity * time_delta);
}
vec3 compute_position_from_velocity(vec3 position, vec3 velocity, float time_delta){
	return position + (velocity * time_delta);
}
vec4 compute_position_from_velocity(vec4 position, vec4 velocity, float time_delta){
	return position + (velocity * time_delta);
}