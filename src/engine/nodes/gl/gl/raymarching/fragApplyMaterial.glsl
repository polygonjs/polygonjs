// start applyMaterial builder define code



// --- applyMaterial SPLIT ---
vec3 applyMaterialWithoutRefraction(vec3 p, vec3 n, vec3 rayDir, int mat, inout SDFContext sdfContext){

	vec3 col = vec3(1.);
	// --- REFLECTION NOT ALLOWED - START
	// --- REFRACTION NOT ALLOWED - START
	// start applyMaterial builder body code
	
	// --- REFLECTION NOT ALLOWED - END
	// --- REFRACTION NOT ALLOWED - END
	return col;
}

vec3 applyMaterialWithoutReflection(vec3 p, vec3 n, vec3 rayDir, int mat, inout SDFContext sdfContext){

	vec3 col = vec3(1.);
	// --- REFLECTION NOT ALLOWED - START
	// --- REFRACTION NOT ALLOWED - START
	// start applyMaterial builder body code
	
	// --- REFLECTION NOT ALLOWED - END
	// --- REFRACTION NOT ALLOWED - END
	return col;
}
#ifdef RAYMARCHED_REFLECTIONS
vec3 GetReflection(vec3 p, vec3 n, vec3 rayDir, float biasMult, sampler2D envMap, int reflectionDepth, inout SDFContext sdfContextMain){
	bool hitReflection = true;
	vec3 reflectedColor = vec3(0.);
	#pragma unroll_loop_start
	for(int i=0; i < reflectionDepth; i++) {
		if(hitReflection){
			rayDir = reflect(rayDir, n);
			p += n*SURF_DIST*biasMult;
			SDFContext sdfContext = RayMarch(p, rayDir, 1.);
			#if defined( DEBUG_STEPS_COUNT )
				sdfContextMain.stepsCount += sdfContext.stepsCount;
			#endif
			if( sdfContext.d >= MAX_DIST){
				hitReflection = false;
				reflectedColor = envMapSample(rayDir, envMap);
			}
			if(hitReflection){
				p += rayDir * sdfContext.d;
				n = GetNormal(p);
				vec3 matCol = applyMaterialWithoutReflection(p, n, rayDir, sdfContext.matId, sdfContextMain);
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
vec4 GetRefractedData(vec3 p, vec3 n, vec3 rayDir, float ior, float biasMult, sampler2D envMap, float refractionMaxDist, int refractionDepth, inout SDFContext sdfContextMain){
	bool hitRefraction = true;
	bool changeSide = true;
	#ifdef RAYMARCHED_REFRACTIONS_START_OUTSIDE_MEDIUM
	float side = -1.;
	#else
	float side =  1.;
	#endif
	float iorInverted = 1. / ior;
	vec3 refractedColor = vec3(0.);
	float distanceInsideMedium=0.;
	float totalRefractedDistance=0.;

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
			#if defined( DEBUG_STEPS_COUNT )
				sdfContextMain.stepsCount += sdfContext.stepsCount;
			#endif
			totalRefractedDistance += sdfContext.d;
			if( abs(sdfContext.d) >= MAX_DIST || totalRefractedDistance > refractionMaxDist ){
				hitRefraction = false;
				refractedColor = envMapSample(rayDir, envMap);
			}
			if(hitRefraction){
				p += rayDir * sdfContext.d;
				n = GetNormal(p) * side;
				vec3 matCol = applyMaterialWithoutRefraction(p, n, rayDir, sdfContext.matId, sdfContextMain);
				refractedColor = matCol;

				// same as: side < 0. ? abs(sdfContext.d) : 0.;
				distanceInsideMedium += (side-1.)*-0.5*abs(sdfContext.d);
				if( changeSide ){
					side *= -1.;
				}
			}
		}
		#ifdef RAYMARCHED_REFRACTIONS_SAMPLE_ENV_MAP_ON_LAST
		if(i == refractionDepth-1){
			refractedColor = envMapSample(rayDir, envMap);
		}
		#endif
	}
	#pragma unroll_loop_end
	return vec4(refractedColor, distanceInsideMedium);
}
float applyRefractionAbsorption(float refractedDataColor, float tint, float distanceInsideMedium, float absorption){
	float blend = smoothstep(0.,1.,absorption*distanceInsideMedium);
	return mix(refractedDataColor, refractedDataColor*tint, blend);
}
vec3 applyRefractionAbsorption(vec3 refractedDataColor, vec3 tint, float distanceInsideMedium, float absorption){
	float blend = smoothstep(0.,1.,absorption*distanceInsideMedium);
	return vec3(
		mix(refractedDataColor.r, refractedDataColor.r*tint.r, blend),
		mix(refractedDataColor.g, refractedDataColor.g*tint.g, blend),
		mix(refractedDataColor.b, refractedDataColor.b*tint.b, blend)
	);
}

#endif

vec3 applyMaterial(vec3 p, vec3 n, vec3 rayDir, int mat, inout SDFContext sdfContext){

	vec3 col = vec3(0.);
	// start applyMaterial builder body code
	
	return col;
}
