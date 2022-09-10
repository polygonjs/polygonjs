// // xyz for color, w for distanceInsideMedium
// vec4 GetRefractedData(vec3 p, vec3 n, vec3 rayDir, float ior, float biasMult, sampler2D envMap, int refractionDepth){
// 	bool hitRefraction = true;
// 	bool changeSide = true;
// 	float side = -1.;
// 	float iorInverted = 1. / ior;
// 	vec3 refractedColor = vec3(0.);
// 	float distanceInsideMedium=0.;

// 	#pragma unroll_loop_start
// 	for(int i=0; i < refractionDepth; i++) {
// 		if(hitRefraction){
// 			float currentIor = side<0. ? iorInverted : ior;
// 			vec3 rayDirPreRefract = rayDir;
// 			rayDir = refract(rayDir, n, currentIor);
// 			changeSide = dot(rayDir, rayDir)!=0.;
// 			if(changeSide == true) {
// 				p -= n*SURF_DIST*(2.+biasMult);
// 			} else {
// 				p += n*SURF_DIST*(   biasMult);
// 				rayDir = reflect(rayDirPreRefract, n);
// 			}
// 			SDFContext sdfContext;// = RayMarch(p, rayDir, side);
// 			if( abs(sdfContext.d) >= MAX_DIST ){
// 				hitRefraction = false;
// 				refractedColor = envMapSample(rayDir, envMap);
// 			}
// 			if(hitRefraction){
// 				p += rayDir * sdfContext.d;
// 				n = GetNormal(p) * side;
// 				vec3 matCol = applyMaterialWithoutRefraction(p, n, rayDir, sdfContext.matId);
// 				refractedColor = matCol;

// 				distanceInsideMedium += side < 0. ? abs(sdfContext.d) : 0.;
// 				if( changeSide ){
// 					side *= -1.;
// 				}
// 			}
// 		}
// 	}
// 	#pragma unroll_loop_end
// 	return vec4(refractedColor, distanceInsideMedium);
// }
