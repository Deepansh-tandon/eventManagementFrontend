import { useState } from 'react';
import { useProfileStore } from '../store/profileStore';

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

interface CreateProfileProps {
	onSuccess?: () => void;
}

export const CreateProfile = ({ onSuccess }: CreateProfileProps) => {
	const [name, setName] = useState('');
	const [timezone, setTimezone] = useState('America/New_York');
	const [error, setError] = useState('');
	const { createProfile, loading } = useProfileStore();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!name.trim()) {
			setError('Name is required');
			return;
		}

		try {
			await createProfile(name.trim(), timezone);
			setName('');
			setTimezone('America/New_York');
			if (onSuccess) {
				onSuccess();
			}
		} catch (err: any) {
			setError(err.response?.data?.error?.message || 'Failed to create profile');
		}
	};

	return (
		<div className="create-profile">
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="name">Profile Name</label>
					<input
						id="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Enter profile name"
						disabled={loading}
					/>
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

				{error && <div className="error-message">{error}</div>}

				<div className="form-actions">
					<button type="submit" className="btn-primary" disabled={loading}>
						{loading ? 'Creating...' : 'Create Profile'}
					</button>
				</div>
			</form>
		</div>
	);
};





