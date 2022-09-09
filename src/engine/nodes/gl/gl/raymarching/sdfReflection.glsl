// --- REFLECTION - START
bool hit = true;
#pragma unroll_loop_start
for(int i=0; i < __reflectionDepth__; i++) {
	if(hit){
		rayDir = reflect(rayDir, n);
		SDFContext sdfContext = RayMarch(p+n*0.01, rayDir);
		if( sdfContext.d >= MAX_DIST){ hit = false; }
		if(hit){
			p += rayDir * sdfContext.d;
			n = GetNormal(p);
			vec3 matCol = applyMaterialWithoutReflection(p, n, rayDir, sdfContext.matId);
			// vec4 pass = Render(ro, rd, ref, i==numBounces-1.);
			col += matCol * __reflectivity__;
		}
		
		// fil*=ref;
	}
}
#pragma unroll_loop_end
// --- REFLECTION - END