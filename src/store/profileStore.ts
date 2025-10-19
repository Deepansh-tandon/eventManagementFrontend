import { create } from 'zustand';
import { profilesApi } from '../lib/api';
import type { Profile } from '../types';

interface ProfileState {
	profiles: Profile[];
	selectedProfile: Profile | null;
	loading: boolean;
	error: string | null;
	
	fetchProfiles: () => Promise<void>;
	createProfile: (name: string, timezone?: string) => Promise<void>;
	selectProfile: (profile: Profile | null) => void;
	updateTimezone: (id: string, timezone: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
	profiles: [],
	selectedProfile: null,
	loading: false,
	error: null,
	
	fetchProfiles: async () => {
		set({ loading: true, error: null });
		try {
			const response = await profilesApi.list();
			if (response.data.success && response.data.data) {
				set({ profiles: response.data.data, loading: false });
			}
		} catch (error: any) {
			set({ error: error.message, loading: false });
		}
	},
	
	createProfile: async (name: string, timezone = 'UTC') => {
		set({ loading: true, error: null });
		try {
			const response = await profilesApi.create({ name, timezone });
			if (response.data.success && response.data.data) {
				set({ profiles: [...get().profiles, response.data.data], loading: false });
			}
		} catch (error: any) {
			set({ error: error.message, loading: false });
			throw error;
		}
	},
	
	selectProfile: (profile: Profile | null) => {
		set({ selectedProfile: profile });
	},
	
	updateTimezone: async (id: string, timezone: string) => {
		set({ loading: true, error: null });
		try {
			const response = await profilesApi.updateTimezone(id, timezone);
			if (response.data.success && response.data.data) {
				const updated = response.data.data;
				set({
					profiles: get().profiles.map(p => p._id === id ? updated : p),
					selectedProfile: get().selectedProfile?._id === id ? updated : get().selectedProfile,
					loading: false
				});
			}
		} catch (error: any) {
			set({ error: error.message, loading: false });
			throw error;
		}
	}
}));






