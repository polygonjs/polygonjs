vec3 compute_fog(vec4 mvPosition, vec3 base_color, vec3 fog_color, float near, float far) {
	float blend = (-mvPosition.z - near) / (far - near);
	blend = clamp(blend, 0.0, 1.0);
	return blend * fog_color + (1.0 - blend) * base_color;
}