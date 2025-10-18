import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			theme: 'light',
			toggleTheme: () =>
				set((state) => {
					const newTheme = state.theme === 'light' ? 'dark' : 'light';
					document.documentElement.setAttribute('data-theme', newTheme);
					return { theme: newTheme };
				}),
			setTheme: (theme) => {
				document.documentElement.setAttribute('data-theme', theme);
				set({ theme });
			},
		}),
		{
			name: 'theme-storage',
		}
	)
);

