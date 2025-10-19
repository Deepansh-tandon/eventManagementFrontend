import { useState, useEffect, useRef } from 'react';
import { useEventStore } from '../store/eventStore';
import { useProfileStore } from '../store/profileStore';
import { assignmentsApi } from '../lib/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { Event, Profile } from '../types';

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

interface EditEventProps {
	event: Event;
	onClose: () => void;
	onSuccess: () => void;
	viewTimezone?: string;
}

export const EditEvent = ({ event, onClose, onSuccess, viewTimezone }: EditEventProps) => {
	const { updateEvent } = useEventStore();
	const { selectedProfile, profiles } = useProfileStore();
	
	const [title, setTitle] = useState(event.title);
	const [description, setDescription] = useState(event.description || '');
	const [timezone, setTimezone] = useState(viewTimezone || event.createdByTimezone || 'America/New_York');
	const [startDate, setStartDate] = useState('');
	const [startTime, setStartTime] = useState('');
	const [endDate, setEndDate] = useState('');
	const [endTime, setEndTime] = useState('');
	const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
	const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
	const [profileSearchTerm, setProfileSearchTerm] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const profileDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!selectedProfile) {
			console.error('ERROR: No profile selected! Cannot edit event.');
			setError('Please select a profile from the dropdown at the top before editing.');
			return;
		}
		console.log('Profile selected:', selectedProfile._id, selectedProfile.name);
				
		const displayTz = viewTimezone || event.createdByTimezone || selectedProfile?.timezone || 'UTC';
		
		if (event.startLocal) {
			const startDayjs = dayjs(event.startLocal);
			setStartDate(startDayjs.format('YYYY-MM-DD'));
			setStartTime(startDayjs.format('HH:mm'));
		} else {
			const startDayjs = dayjs(event.startAtUtc).tz(displayTz);
			setStartDate(startDayjs.format('YYYY-MM-DD'));
			setStartTime(startDayjs.format('HH:mm'));
		}
		
		if (event.endLocal) {
			const endDayjs = dayjs(event.endLocal);
			setEndDate(endDayjs.format('YYYY-MM-DD'));
			setEndTime(endDayjs.format('HH:mm'));
		} else {
			const endDayjs = dayjs(event.endAtUtc).tz(displayTz);
			setEndDate(endDayjs.format('YYYY-MM-DD'));
			setEndTime(endDayjs.format('HH:mm'));
		}
		
		loadAssignedProfiles();
	}, [event, selectedProfile]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
				setIsProfileDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const loadAssignedProfiles = async () => {
		try {
			const response = await assignmentsApi.getProfilesByEvent(event._id);
			if (response.data.success && response.data.data) {
				const assigned = response.data.data;
				setSelectedProfileIds(assigned.map((p: Profile) => p._id));
			}
		} catch (err) {
			console.error('Failed to load assigned profiles:', err);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			if (!selectedProfile) {
				setError('Please select a profile before editing an event');
				setLoading(false);
				return;
			}

			if (!title.trim()) {
				setError('Title is required');
				setLoading(false);
				return;
			}

			if (!startDate || !startTime || !endDate || !endTime) {
				setError('Start and end date/time are required');
				setLoading(false);
				return;
			}

			if (selectedProfileIds.length === 0) {
				setError('At least one profile must be selected');
				setLoading(false);
				return;
			}

			const updateData: any = {};

			console.log('🔄 Preparing update with profileId:', selectedProfile._id);

			if (title !== event.title) {
				updateData.title = title;
			}
			if (description !== event.description) {
				updateData.description = description;
			}

			// Create timezone-naive ISO strings (backend applies timezone)
			const newStartIso = `${startDate}T${startTime}:00`;
			const newEndIso = `${endDate}T${endTime}:00`;

			if (dayjs(newEndIso).isBefore(newStartIso)) {
				setError('End time must be after start time');
				setLoading(false);
				return;
			}

			updateData.startLocalIso = newStartIso;
			updateData.endLocalIso = newEndIso;
			updateData.timezone = timezone;
			updateData.updatedByProfileId = selectedProfile._id;

			const response = await assignmentsApi.getProfilesByEvent(event._id);
			if (response.data.success && response.data.data) {
				const currentlyAssigned = response.data.data.map((p: Profile) => p._id);
				const addProfileIds = selectedProfileIds.filter(id => !currentlyAssigned.includes(id));
				const removeProfileIds = currentlyAssigned.filter((id: string) => !selectedProfileIds.includes(id));

				if (addProfileIds.length > 0) {
					updateData.addProfileIds = addProfileIds;
				}
				if (removeProfileIds.length > 0) {
					updateData.removeProfileIds = removeProfileIds;
				}
			}

			console.log('Sending update data:', updateData);

			await updateEvent(event._id, updateData, viewTimezone);
			onSuccess();
		} catch (err: any) {
			setError(err.response?.data?.error?.message || 'Failed to update event');
		} finally {
			setLoading(false);
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
		<div className="edit-event">
			<div className="modal-header">
				<h2>Edit Event</h2>
				<button onClick={onClose} className="close-btn">&times;</button>
			</div>

			<form onSubmit={handleSubmit} className="event-form">
				{error && <div className="error-message">{error}</div>}

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
							disabled={loading}
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

				<div className="form-actions">
					<button
						type="button"
						onClick={onClose}
						className="btn-secondary"
						disabled={loading}
					>
						Cancel
					</button>
					<button type="submit" className="btn-primary" disabled={loading}>
						{loading ? 'Updating...' : 'Update Event'}
					</button>
				</div>
			</form>
		</div>
	);
};

