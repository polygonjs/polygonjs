float cycle(float val, float val_min, float val_max){
	if(val >= val_min && val < val_max){
		return val;
	} else {
		float range = val_max - val_min;
		if(val >= val_max){
			float delta = (val - val_max);
			return val_min + mod(delta, range);
		} else {
			float delta = (val_min - val);
			return val_max - mod(delta, range);
		}
	}
}