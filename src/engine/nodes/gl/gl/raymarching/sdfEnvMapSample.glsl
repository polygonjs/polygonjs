
struct EnvMap {
	vec3 tint;
	float intensity;
	float fresnel;
	float fresnelPower;
};
vec3 envMapSample(vec3 rayDir, sampler2D map){
	// http://www.pocketgl.com/reflections/
	vec2 uv = vec2( atan( -rayDir.z, -rayDir.x ) * RECIPROCAL_PI2 + 0.5, rayDir.y * 0.5 + 0.5 );
	vec3 env = texture2D(map, uv).rgb;
	return env;
}
vec3 envMapSampleWithFresnel(vec3 rayDir, sampler2D map, EnvMap envMap, vec3 n, vec3 cameraPosition){
	// http://www.pocketgl.com/reflections/
	vec3 env = envMapSample(rayDir, map).rgb;
	float fresnel = pow(1.-dot(normalize(cameraPosition), n), envMap.fresnelPower);
	float fresnelFactor = (1.-envMap.fresnel) + envMap.fresnel*fresnel;
	return env * envMap.tint * envMap.intensity * fresnelFactor;
}