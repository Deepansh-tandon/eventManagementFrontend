import { useState, useRef, useEffect } from 'react';
import { useProfileStore } from '../store/profileStore';
import { useEventStore } from '../store/eventStore';
import { CreateProfile } from './CreateProfile';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const COMMON_TIMEZONES = [
	'UTC',
	'America/New_York',
	'America/Los_Angeles',
	'America/Chicago',
	'Europe/London',
	'Europe/Paris',
	'Asia/Tokyo',
	'Asia/Kolkata',
	'Asia/Shanghai',
	'Australia/Sydney'
];

export const CreateEvent = () => {
	const { profiles, selectedProfile } = useProfileStore();
	const { createEvent, loading } = useEventStore();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [timezone, setTimezone] = useState(selectedProfile?.timezone || 'America/New_York');
	const [startDate, setStartDate] = useState('');
	const [startTime, setStartTime] = useState('09:00');
	const [endDate, setEndDate] = useState('');
	const [endTime, setEndTime] = useState('09:00');
	const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
	const [error, setError] = useState('');
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
	const [profileSearchTerm, setProfileSearchTerm] = useState('');
	const [showCreateProfile, setShowCreateProfile] = useState(false);
	const profileDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (selectedProfile) {
			setTimezone(selectedProfile.timezone);
		}
	}, [selectedProfile]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
				setIsProfileDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!title.trim()) {
			setError('Title is required');
			return;
		}

		if (!startDate || !startTime || !endDate || !endTime) {
			setError('Start and end date/time are required');
			return;
		}

		if (selectedProfileIds.length === 0) {
			setError('At least one profile must be selected');
			return;
		}

		// Create timezone-naive ISO strings (backend will apply timezone)
		const startLocalIso = `${startDate}T${startTime}:00`;
		const endLocalIso = `${endDate}T${endTime}:00`;

		if (dayjs(endLocalIso).isBefore(startLocalIso)) {
			setError('End time must be after start time');
			return;
		}

		try {
			await createEvent({
				title: title.trim(),
				description: description.trim(),
				timezone,
				startLocalIso,
				endLocalIso,
				profileIds: selectedProfileIds,
				createdByProfileId: selectedProfile?._id
			});

			// Reset form
			setTitle('');
			setDescription('');
			setStartDate('');
			setStartTime('09:00');
			setEndDate('');
			setEndTime('09:00');
			setSelectedProfileIds([]);
		} catch (err: any) {
			setError(err.response?.data?.error?.message || 'Failed to create event');
		}
	};

	const toggleProfile = (profileId: string) => {
		setSelectedProfileIds(prev =>
			prev.includes(profileId)
				? prev.filter(id => id !== profileId)
				: [...prev, profileId]
		);
	};

	const filteredProfiles = profiles.filter(profile =>
		profile.name.toLowerCase().includes(profileSearchTerm.toLowerCase())
	);

	const selectedProfiles = profiles.filter(p => selectedProfileIds.includes(p._id));
	const profileDisplayText = selectedProfileIds.length > 0
		? `${selectedProfileIds.length} profile${selectedProfileIds.length > 1 ? 's' : ''} selected`
		: 'Select profiles...';

	return (
		<div className="create-event">
			<h3>Create Event</h3>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="title">Title</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Event title"
						disabled={loading}
					/>
				</div>

				<div className="form-group">
					<label htmlFor="description">Description</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Event description (optional)"
						disabled={loading}
						rows={3}
					/>
				</div>

				<div className="form-group">
					<label>Profiles</label>
					<div className="multi-select-wrapper" ref={profileDropdownRef}>
						<button
							type="button"
							className={`multi-select-trigger ${selectedProfileIds.length > 0 ? 'selected' : ''}`}
							onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
						>
							<span>{profileDisplayText}</span>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{isProfileDropdownOpen && (
							<div className="multi-select-dropdown">
								<div className="multi-select-search">
									<input
										type="text"
										placeholder="Search profiles..."
										value={profileSearchTerm}
										onChange={(e) => setProfileSearchTerm(e.target.value)}
										onClick={(e) => e.stopPropagation()}
									/>
								</div>
								<div>
									{filteredProfiles.length > 0 ? (
										filteredProfiles.map((profile) => (
											<div
												key={profile._id}
												className={`multi-select-option ${selectedProfileIds.includes(profile._id) ? 'checked' : ''}`}
												onClick={() => toggleProfile(profile._id)}
											>
												<input
													type="checkbox"
													checked={selectedProfileIds.includes(profile._id)}
													onChange={() => {}}
													onClick={(e) => e.stopPropagation()}
												/>
												<span>{profile.name}</span>
											</div>
										))
									) : (
										<div style={{ padding: '1rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
											No profiles found
										</div>
									)}
								</div>
								<div
									className="add-profile-link"
									onClick={() => {
										setIsProfileDropdownOpen(false);
										setShowCreateProfile(true);
									}}
								>
									<span>+ Add Profile</span>
								</div>
							</div>
						)}
					</div>
					{selectedProfiles.length > 0 && (
						<div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
							Selected: {selectedProfiles.map(p => p.name).join(', ')}
						</div>
					)}
				</div>

				<div className="form-group">
					<label htmlFor="timezone">Timezone</label>
					<select
						id="timezone"
						value={timezone}
						onChange={(e) => setTimezone(e.target.value)}
						disabled={loading}
					>
						{COMMON_TIMEZONES.map((tz) => (
							<option key={tz} value={tz}>
								{tz.replace(/_/g, ' ')}
							</option>
						))}
					</select>
				</div>

				<div className="form-group">
					<label>Start Date & Time</label>
					<div className="form-row">
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							disabled={loading}
							placeholder="Pick a date"
						/>
						<input
							type="time"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
							disabled={loading}
							style={{ width: '120px' }}
						/>
					</div>
				</div>

				<div className="form-group">
					<label>End Date & Time</label>
					<div className="form-row">
						<input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							disabled={loading}
							placeholder="Pick a date"
						/>
						<input
							type="time"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
							disabled={loading}
							style={{ width: '120px' }}
						/>
					</div>
				</div>

				{error && <div className="error-message">{error}</div>}

				<button type="submit" className="btn-primary" disabled={loading}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					<span>{loading ? 'Creating...' : 'Create Event'}</span>
				</button>
			</form>

			{/* Create Profile Modal */}
			{showCreateProfile && (
				<div className="modal-overlay" onClick={() => setShowCreateProfile(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>Create Profile</h2>
							<button className="close-btn" onClick={() => setShowCreateProfile(false)}>×</button>
						</div>
						<CreateProfile onSuccess={() => setShowCreateProfile(false)} />
					</div>
				</div>
			)}
		</div>
	);
};
