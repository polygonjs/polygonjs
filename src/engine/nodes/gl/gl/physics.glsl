vec3 compute_velocity_from_acceleration(vec3 vel, vec3 force, float mass, float time_delta){
	vec3 impulse = (force * mass) * time_delta;
	return vel + impulse;
}
vec3 compute_position_from_velocity(vec3 position, vec3 velocity, float time_delta){
	return position + (velocity * time_delta);
}