export enum AnimNodeEasing {
	NONE = 'none',
	POWER1 = 'power1',
	POWER2 = 'power2',
	POWER3 = 'power3',
	POWER4 = 'power4',
	BACK = 'back',
	ELASTIC = 'elastic',
	BOUNCE = 'bounce',
	// rough
	SLOW = 'slow',
	STEPS = 'steps',
	CIRC = 'circ',
	EXPO = 'expo',
	SINE = 'sine',
	// Custom
}
export const EASINGS: AnimNodeEasing[] = [
	AnimNodeEasing.NONE,
	AnimNodeEasing.POWER1,
	AnimNodeEasing.POWER2,
	AnimNodeEasing.POWER3,
	AnimNodeEasing.POWER4,
	AnimNodeEasing.BACK,
	AnimNodeEasing.ELASTIC,
	AnimNodeEasing.BOUNCE,

	AnimNodeEasing.SLOW,
	AnimNodeEasing.STEPS,
	AnimNodeEasing.CIRC,
	AnimNodeEasing.EXPO,
	AnimNodeEasing.SINE,
];
export enum InOutMode {
	IN = 'in',
	OUT = 'out',
	IN_OUT = 'inOut',
}
export const IN_OUT_MODES: InOutMode[] = [InOutMode.IN, InOutMode.OUT, InOutMode.IN_OUT];
