export interface Profile {
	_id: string;
	name: string;
	timezone: string;
	createdAt: string;
	updatedAt: string;
}

export interface Event {
	_id: string;
	title: string;
	description?: string;
	startAtUtc: string;
	endAtUtc: string;
	startLocal?: string;
	endLocal?: string;
	createdByProfileId?: string;
	createdByTimezone?: string;
	updatedByProfileId?: string;
	updatedByTimezone?: string;
	createdAt: string;
	updatedAt: string;
}

export interface EventAssignment {
	_id: string;
	eventId: string;
	profileId: string;
	assignedAt: string;
}

export interface EventUpdateLog {
	_id: string;
	eventId: string;
	updatedByProfileId: string;
	updatedByTimezone: string;
	updatedAtUtc: string;
	updatedAtLocal?: string;
	changes: Array<{
		field: string;
		previous: any;
		next: any;
	}>;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: {
		code: string;
		message: string;
		details?: any;
	};
}






