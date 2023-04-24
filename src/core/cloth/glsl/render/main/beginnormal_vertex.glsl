vec2 clothSolverUv = getClothSolverUV( id );
vec3 transformed = ( texture2D( tPosition0, clothSolverUv ).xyz + texture2D( tPosition1, clothSolverUv ).xyz ) / 1024.0;
vec3 objectNormal = normalize( texture2D( tNormal, clothSolverUv ).xyz );

