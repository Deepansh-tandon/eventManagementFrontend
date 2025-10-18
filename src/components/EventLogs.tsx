import { useState, useEffect } from 'react';
import { logsApi } from '../lib/api';
import { useProfileStore } from '../store/profileStore';
import dayjs from 'dayjs';
import type { EventUpdateLog } from '../types';

interface EventLogsProps {
	eventId: string;
	eventTitle: string;
	onClose: () => void;
}

export const EventLogs = ({ eventId, eventTitle, onClose }: EventLogsProps) => {
	const { selectedProfile } = useProfileStore();
	const [logs, setLogs] = useState<EventUpdateLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadLogs();
	}, [eventId, selectedProfile]);

	const loadLogs = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await logsApi.getEventLogs(
				eventId,
				selectedProfile?.timezone || 'UTC'
			);
			if (response.data.success && response.data.data) {
				setLogs(response.data.data);
			}
		} catch (err: any) {
			setError(err.response?.data?.error?.message || 'Failed to load logs');
		} finally {
			setLoading(false);
		}
	};

	const formatValue = (value: any): string => {
		if (value === null || value === undefined) {
			return 'N/A';
		}
		if (Array.isArray(value)) {
			return value.join(', ');
		}
		if (typeof value === 'object') {
			return JSON.stringify(value, null, 2);
		}
		// Check if it's an ISO date string
		if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
			return dayjs(value).format('MMM D, YYYY h:mm A');
		}
		return String(value);
	};

	const getFieldLabel = (field: string): string => {
		const labels: Record<string, string> = {
			title: 'Title',
			description: 'Description',
			startAtUtc: 'Start Time',
			endAtUtc: 'End Time',
			addProfileIds: 'Added Profiles',
			removeProfileIds: 'Removed Profiles'
		};
		return labels[field] || field;
	};

	return (
		<div className="event-logs">
			<div className="modal-header">
				<h2>Update History</h2>
				<button onClick={onClose} className="close-btn">&times;</button>
			</div>

			<div className="logs-content">
				<h3>{eventTitle}</h3>

				{loading && <p className="loading">Loading logs...</p>}
				{error && <div className="error-message">{error}</div>}

				{!loading && !error && logs.length === 0 && (
					<p className="no-logs">No update history available for this event.</p>
				)}

				{!loading && !error && logs.length > 0 && (
					<div className="logs-list">
						{logs.map((log) => (
							<div key={log._id} className="log-entry">
								<div className="log-header">
									<span className="log-date">
										{log.updatedAtLocal
											? dayjs(log.updatedAtLocal).format('MMM D, YYYY h:mm A')
											: dayjs(log.updatedAtUtc).format('MMM D, YYYY h:mm A')}
									</span>
									<span className="log-timezone">
										({log.updatedByTimezone})
									</span>
								</div>

								<div className="log-changes">
									{log.changes.map((change, idx) => (
										<div key={idx} className="change-item">
											<div className="change-field">
												<strong>{getFieldLabel(change.field)}</strong>
											</div>
											<div className="change-values">
												<div className="old-value">
													<span className="label">Before:</span>
													<span className="value">{formatValue(change.previous)}</span>
												</div>
												<div className="arrow">→</div>
												<div className="new-value">
													<span className="label">After:</span>
													<span className="value">{formatValue(change.next)}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="modal-footer">
				<button onClick={onClose} className="btn-secondary">
					Close
				</button>
			</div>
		</div>
	);
};



