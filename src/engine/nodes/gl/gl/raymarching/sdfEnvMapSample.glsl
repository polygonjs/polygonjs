
struct EnvMapProps {
	vec3 tint;
	float intensity;
	float roughness;
	float fresnel;
	float fresnelPower;
};
uniform sampler2D envMap;
uniform float envMapIntensity;
uniform float roughness;
#ifdef ROTATE_ENV_MAP_Y
	uniform float envMapRotationY;
#endif
vec3 envMapSample(vec3 rayDir, float envMapRoughness){
	// http://www.pocketgl.com/reflections/
	vec3 env = vec3(0.);
	// vec2 uv = vec2( atan( -rayDir.z, -rayDir.x ) * RECIPROCAL_PI2 + 0.5, rayDir.y * 0.5 + 0.5 );
	// vec3 env = texture2D(map, uv).rgb;
	#ifdef ENVMAP_TYPE_CUBE_UV
		#ifdef ROTATE_ENV_MAP_Y
			rayDir = rotateWithAxisAngle(rayDir, vec3(0.,1.,0.), envMapRotationY);
		#endif
		env = textureCubeUV(envMap, rayDir, envMapRoughness * roughness).rgb;
	#endif
	return env;
}
vec3 envMapSampleWithFresnel(vec3 rayDir, EnvMapProps envMapProps, vec3 n, vec3 cameraPosition){
	// http://www.pocketgl.com/reflections/
	vec3 env = envMapSample(rayDir, envMapProps.roughness);
	float fresnel = pow(1.-dot(normalize(cameraPosition), n), envMapProps.fresnelPower);
	float fresnelFactor = (1.-envMapProps.fresnel) + envMapProps.fresnel*fresnel;
	return env * envMapIntensity * envMapProps.tint * envMapProps.intensity * fresnelFactor;
}