
vec3 clothSolverPosition(sampler2D tPosition0, sampler2D tPosition1, vec2 clothSolverUv) {
	return ( texture2D( tPosition0, clothSolverUv ).xyz + texture2D( tPosition1, clothSolverUv ).xyz ) / 1024.0;
}
vec3 clothSolverNormal(sampler2D tNormal, vec2 clothSolverUv) {
	return normalize( texture2D( tNormal, clothSolverUv ).xyz );
}