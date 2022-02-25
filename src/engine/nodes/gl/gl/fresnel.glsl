float fresnel(vec4 worldPosition, vec3 worldNormal, vec3 cameraPosition){
	return dot(
		normalize(worldNormal),
		normalize(cameraPosition - worldPosition.xyz)
	);
}