// start applyMaterial builder define code



// --- applyMaterial SPLIT ---
vec3 applyMaterialWithoutRefraction(vec3 p, vec3 n, vec3 rayDir, int mat){

	vec3 col = vec3(1.);
	// --- REFLECTION NOT ALLOWED - START
	// --- REFRACTION NOT ALLOWED - START
	// start applyMaterial builder body code
	
	// --- REFLECTION NOT ALLOWED - END
	// --- REFRACTION NOT ALLOWED - END
	return col;
}

vec3 applyMaterialWithoutReflection(vec3 p, vec3 n, vec3 rayDir, int mat){

	vec3 col = vec3(1.);
	// --- REFLECTION NOT ALLOWED - START
	// --- REFRACTION NOT ALLOWED - START
	// start applyMaterial builder body code
	
	// --- REFLECTION NOT ALLOWED - END
	// --- REFRACTION NOT ALLOWED - END
	return col;
}
#ifdef RAYMARCHED_REFLECTIONS
vec3 GetReflection(vec3 p, vec3 n, vec3 rayDir, float biasMult, sampler2D envMap, int reflectionDepth){
	bool hitReflection = true;
	vec3 reflectedColor = vec3(0.);
	#pragma unroll_loop_start
	for(int i=0; i < reflectionDepth; i++) {
		if(hitReflection){
			rayDir = reflect(rayDir, n);
			p += n*SURF_DIST*biasMult;
			SDFContext sdfContext = RayMarch(p, rayDir, 1.);
			if( sdfContext.d >= MAX_DIST){
				hitReflection = false;
				reflectedColor = envMapSample(rayDir, envMap);
			}
			if(hitReflection){
				p += rayDir * sdfContext.d;
				n = GetNormal(p);
				vec3 matCol = applyMaterialWithoutReflection(p, n, rayDir, sdfContext.matId);
				reflectedColor += matCol;
			}
		}
	}
	#pragma unroll_loop_end
	return reflectedColor;
}
#endif

#ifdef RAYMARCHED_REFRACTIONS
// xyz for color, w for distanceInsideMedium
vec4 GetRefractedData(vec3 p, vec3 n, vec3 rayDir, float ior, float biasMult, sampler2D envMap, int refractionDepth){
	bool hitRefraction = true;
	bool changeSide = true;
	float side = -1.;
	float iorInverted = 1. / ior;
	vec3 refractedColor = vec3(0.);
	float distanceInsideMedium=0.;

	#pragma unroll_loop_start
	for(int i=0; i < refractionDepth; i++) {
		if(hitRefraction){
			float currentIor = side<0. ? iorInverted : ior;
			vec3 rayDirPreRefract = rayDir;
			rayDir = refract(rayDir, n, currentIor);
			changeSide = dot(rayDir, rayDir)!=0.;
			if(changeSide == true) {
				p -= n*SURF_DIST*(2.+biasMult);
			} else {
				p += n*SURF_DIST*(   biasMult);
				rayDir = reflect(rayDirPreRefract, n);
			}
			SDFContext sdfContext = RayMarch(p, rayDir, side);
			if( abs(sdfContext.d) >= MAX_DIST ){
				hitRefraction = false;
				refractedColor = envMapSample(rayDir, envMap);
			}
			if(hitRefraction){
				p += rayDir * sdfContext.d;
				n = GetNormal(p) * side;
				vec3 matCol = applyMaterialWithoutRefraction(p, n, rayDir, sdfContext.matId);
				refractedColor = matCol;

				distanceInsideMedium += side < 0. ? abs(sdfContext.d) : 0.;
				if( changeSide ){
					side *= -1.;
				}
			}
		}
	}
	#pragma unroll_loop_end
	return vec4(refractedColor, distanceInsideMedium);
}
vec3 applyRefractionAbsorbtion(vec4 refractedData, vec3 tint, float absorbtion){
	vec3 refractedColor = refractedData.rgb;
	float distanceInsideMedium = refractedData.w;
	float tintFactor = 1.+(distanceInsideMedium * absorbtion);
	tint.r = pow(tint.r, tintFactor);
	tint.g = pow(tint.g, tintFactor);
	tint.b = pow(tint.b, tintFactor);
	refractedColor = refractedColor * tint;
	return refractedColor;
}
#endif

vec3 applyMaterial(vec3 p, vec3 n, vec3 rayDir, int mat){

	vec3 col = vec3(0.);
	// start applyMaterial builder body code
	
	return col;
}
