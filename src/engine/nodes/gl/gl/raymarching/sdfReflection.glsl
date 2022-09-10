// --- REFLECTION - START
bool hitReflection = true;
#pragma unroll_loop_start
for(int i=0; i < __reflectionDepth__; i++) {
	if(hitReflection){
		rayDir = reflect(rayDir, n);
		SDFContext sdfContext = RayMarch(p+n*SURF_DIST*__reflectionBiasMult__, rayDir, 1.);
		if( sdfContext.d >= MAX_DIST){ hitReflection = false; }
		if(hitReflection){
			p += rayDir * sdfContext.d;
			n = GetNormal(p);
			vec3 matCol = applyMaterialWithoutReflection(p, n, rayDir, sdfContext.matId);
			col += matCol * __reflectivity__;
		}
	}
}
#pragma unroll_loop_end
// --- REFLECTION - END