struct SSSModel {
	bool isActive;
	vec3 color;
	float thickness;
	float power;
	float scale;
	float distortion;
	float ambient;
	float attenuation;
};

void RE_Direct_Scattering(
	const in IncidentLight directLight,
	const in vec2 uv,
	const in GeometricContext geometry,
	const in SSSModel sssModel,
	inout ReflectedLight reflectedLight
	){
	// vec3 thickness = sssModel.thickness; //vec3(0.6,0.6,0.6);//thicknessColor * texture2D(thicknessMap, uv).r;
	vec3 scatteringHalf = normalize(directLight.direction + (geometry.normal * sssModel.distortion));
	float scatteringDot = pow(saturate(dot(geometry.viewDir, -scatteringHalf)), sssModel.power) * sssModel.scale;
	vec3 scatteringIllu = (scatteringDot + sssModel.ambient) * (sssModel.color * sssModel.thickness);
	reflectedLight.directDiffuse += scatteringIllu * sssModel.attenuation * directLight.color;
}