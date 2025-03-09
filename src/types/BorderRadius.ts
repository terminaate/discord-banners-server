export type BorderRadiusNumber = number;
export type BorderRadiusObject = {
	tl?: number;
	tr?: number;
	br?: number;
	bl?: number;
};

export type BorderRadius = BorderRadiusNumber | BorderRadiusObject;
