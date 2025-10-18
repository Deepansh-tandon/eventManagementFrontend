import { create } from 'zustand';
import { eventsApi } from '../lib/api';
import type { Event } from '../types';

interface EventState {
	events: Event[];
	loading: boolean;
	error: string | null;
	
	fetchEventsForProfile: (profileId: string, tz?: string) => Promise<void>;
	createEvent: (data: {
		title: string;
		description?: string;
		timezone: string;
		startLocalIso: string;
		endLocalIso: string;
		profileIds: string[];
		createdByProfileId?: string;
	}) => Promise<void>;
	updateEvent: (id: string, data: {
		title?: string;
		description?: string;
		timezone?: string;
		startLocalIso?: string;
		endLocalIso?: string;
		addProfileIds?: string[];
		removeProfileIds?: string[];
		updatedByProfileId?: string;
	}, tz?: string) => Promise<void>;
	deleteEvent: (id: string) => Promise<void>;
	clearEvents: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
	events: [],
	loading: false,
	error: null,
	
	fetchEventsForProfile: async (profileId: string, tz?: string) => {
		set({ loading: true, error: null });
		try {
			const response = await eventsApi.getForProfile(profileId, tz);
			if (response.data.success && response.data.data) {
				set({ events: response.data.data, loading: false });
			}
		} catch (error: any) {
			set({ error: error.message, loading: false });
		}
	},
	
	createEvent: async (data) => {
		set({ loading: true, error: null });
		try {
			const response = await eventsApi.create(data);
			if (response.data.success && response.data.data) {
				set({ events: [...get().events, response.data.data], loading: false });
			}
		} catch (error: any) {
			set({ error: error.message, loading: false });
			throw error;
		}
	},
	
	updateEvent: async (id: string, data, tz?: string) => {
		set({ loading: true, error: null });
		try {
			const response = await eventsApi.update(id, data, tz);
			if (response.data.success && response.data.data) {
				const updated = response.data.data;
				set({
					events: get().events.map(e => e._id === id ? updated : e),
					loading: false
				});
			}
		} catch (error: any) {
			set({ error: error.message, loading: false });
			throw error;
		}
	},
	
	deleteEvent: async (id: string) => {
		set({ loading: true, error: null });
		try {
			await eventsApi.delete(id);
			set({ events: get().events.filter(e => e._id !== id), loading: false });
		} catch (error: any) {
			set({ error: error.message, loading: false });
			throw error;
		}
	},
	
	clearEvents: () => {
		set({ events: [] });
	}
}));



