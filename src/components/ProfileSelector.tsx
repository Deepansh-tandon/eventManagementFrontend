import { useEffect, useState, useRef } from 'react';
import { useProfileStore } from '../store/profileStore';

interface ProfileSelectorProps {
	onCreateProfile: () => void;
}

export const ProfileSelector = ({ onCreateProfile }: ProfileSelectorProps) => {
	const { profiles, selectedProfile, loading, fetchProfiles, selectProfile } = useProfileStore();
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchProfiles();
	}, [fetchProfiles]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const filteredProfiles = profiles.filter(profile =>
		profile.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="profile-selector">
			<div className="profile-selector-wrapper" ref={dropdownRef}>
				<button
					className="profile-selector-button"
					onClick={() => setIsOpen(!isOpen)}
					disabled={loading}
				>
					<span>
						{selectedProfile ? selectedProfile.name : 'Select current profile...'}
					</span>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{isOpen && (
					<div className="profile-dropdown">
						<div className="profile-search">
							<input
								type="text"
								placeholder="Search current profile..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="profile-options">
							{filteredProfiles.map((profile) => (
								<div
									key={profile._id}
									className={`profile-option ${selectedProfile?._id === profile._id ? 'selected' : ''}`}
									onClick={() => {
										selectProfile(profile);
										setIsOpen(false);
										setSearchTerm('');
									}}
								>
									{profile.name}
								</div>
							))}
						</div>
						<div
							className="add-profile-link"
							onClick={() => {
								setIsOpen(false);
								onCreateProfile();
							}}
						>
							<span>+ Add Profile</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};





