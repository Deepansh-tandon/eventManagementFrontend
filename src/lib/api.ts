import axios from 'axios';
import type { ApiResponse, Profile, Event, EventUpdateLog } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ;

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

// Profiles
export const profilesApi = {
	create: (data: { name: string; timezone?: string }) =>
		api.post<ApiResponse<Profile>>('/profiles', data),
	
	list: () =>
		api.get<ApiResponse<Profile[]>>('/profiles'),
	
	get: (id: string) =>
		api.get<ApiResponse<Profile>>(`/profiles/${id}`),
	
	updateTimezone: (id: string, timezone: string) =>
		api.patch<ApiResponse<Profile>>(`/profiles/${id}/timezone`, { timezone })
};

// Events
export const eventsApi = {
	create: (data: {
		title: string;
		description?: string;
		timezone: string;
		startLocalIso: string;
		endLocalIso: string;
		profileIds: string[];
		createdByProfileId?: string;
	}) => api.post<ApiResponse<Event>>('/events', data),
	
	getForProfile: (profileId: string, tz?: string) =>
		api.get<ApiResponse<Event[]>>('/events', { params: { profileId, tz } }),
	
	get: (id: string, tz?: string) =>
		api.get<ApiResponse<Event>>(`/events/${id}`, { params: { tz } }),
	
	update: (id: string, data: {
		title?: string;
		description?: string;
		timezone?: string;
		startLocalIso?: string;
		endLocalIso?: string;
		addProfileIds?: string[];
		removeProfileIds?: string[];
		updatedByProfileId?: string;
	}, tz?: string) => api.patch<ApiResponse<Event>>(`/events/${id}`, data, { params: { tz } }),
	
	delete: (id: string) =>
		api.delete<ApiResponse<Event>>(`/events/${id}`)
};

// Assignments
export const assignmentsApi = {
	assign: (eventId: string, profileIds: string[]) =>
		api.post<ApiResponse<any>>('/assignments/assign', { eventId, profileIds }),
	
	unassign: (eventId: string, profileIds: string[]) =>
		api.post<ApiResponse<any>>('/assignments/unassign', { eventId, profileIds }),
	
	getProfilesByEvent: (eventId: string) =>
		api.get<ApiResponse<Profile[]>>(`/assignments/event/${eventId}`),
	
	getEventsByProfile: (profileId: string) =>
		api.get<ApiResponse<Event[]>>(`/assignments/profile/${profileId}`)
};

// Logs
export const logsApi = {
	getEventLogs: (eventId: string, tz?: string) =>
		api.get<ApiResponse<EventUpdateLog[]>>(`/logs/event/${eventId}`, { params: { tz } })
};

export default api;



