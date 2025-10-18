import { useEffect, useState } from 'react';
import { useEventStore } from '../store/eventStore';
import { useProfileStore } from '../store/profileStore';
import { EditEvent } from './EditEvent';
import { EventLogs } from './EventLogs';
import dayjs from 'dayjs';
import type { Event } from '../types';

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

export const EventList = () => {
	const { events, loading, fetchEventsForProfile } = useEventStore();
	const { selectedProfile, profiles } = useProfileStore();
	const [editingEvent, setEditingEvent] = useState<Event | null>(null);
	const [viewingLogsFor, setViewingLogsFor] = useState<Event | null>(null);
	const [viewTimezone, setViewTimezone] = useState('America/New_York');

	useEffect(() => {
		if (selectedProfile) {
			setViewTimezone(selectedProfile.timezone);
		}
	}, [selectedProfile]);

	useEffect(() => {
		if (selectedProfile) {
			fetchEventsForProfile(selectedProfile._id, viewTimezone);
		}
	}, [selectedProfile, viewTimezone, fetchEventsForProfile]);

	const handleEditSuccess = () => {
		setEditingEvent(null);
		if (selectedProfile) {
			fetchEventsForProfile(selectedProfile._id, viewTimezone);
		}
	};

	if (loading) {
		return (
			<div className="event-list">
				<div className="loading">Loading events...</div>
			</div>
		);
	}

	return (
		<div className="event-list">
			<div className="event-list-header">
				<h3>Events</h3>
				<div className="view-timezone">
					<label>View in Timezone</label>
					<select
						value={viewTimezone}
						onChange={(e) => setViewTimezone(e.target.value)}
					>
						{COMMON_TIMEZONES.map((tz) => (
							<option key={tz} value={tz}>
								{tz.replace(/_/g, ' ')}
							</option>
						))}
					</select>
				</div>
			</div>

			{!selectedProfile ? (
				<div className="no-events">Please select a profile to view events</div>
			) : events.length === 0 ? (
				<div className="no-events">No events found</div>
			) : (
				<div className="events">
					{events.map((event) => (
						<div key={event._id} className="event-card">
							{event.createdByProfileId && (
								<div className="event-profiles">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<span>Creataed by : {profiles.find(p => p._id === event.createdByProfileId)?.name || 'Unknown'}</span>
								</div>
							)}

							<h4>{event.title}</h4>
							{event.description && <p className="description">{event.description}</p>}
							
							<div className="event-times">
								<div className="event-time-row">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									<span className="event-time-label">Start:</span>
									<span className="event-time-value">
										{event.startLocal ? dayjs(event.startLocal.substring(0, 19)).format('MMM D, YYYY') : dayjs(event.startAtUtc).format('MMM D, YYYY')}
									</span>
								</div>
								<div className="event-time-row">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span style={{ marginLeft: '46px' }}>
										{event.startLocal ? dayjs(event.startLocal.substring(0, 19)).format('h:mm A') : dayjs(event.startAtUtc).format('h:mm A')}
									</span>
								</div>
								<div className="event-time-row">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									<span className="event-time-label">End:</span>
									<span className="event-time-value">
										{event.endLocal ? dayjs(event.endLocal.substring(0, 19)).format('MMM D, YYYY') : dayjs(event.endAtUtc).format('MMM D, YYYY')}
									</span>
								</div>
								<div className="event-time-row">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span style={{ marginLeft: '46px' }}>
										{event.endLocal ? dayjs(event.endLocal.substring(0, 19)).format('h:mm A') : dayjs(event.endAtUtc).format('h:mm A')}
									</span>
								</div>
							</div>

							<div className="event-metadata">
								<span>Timezone: {viewTimezone.replace(/_/g, ' ')}</span>
								<span>Created: {dayjs(event.createdAt).format('MMM D, YYYY [at] h:mm A')}</span>
								<span>Updated: {dayjs(event.updatedAt).format('MMM D, YYYY [at] h:mm A')}</span>
							</div>

							<div className="event-actions">
								<button
									onClick={() => setEditingEvent(event)}
									className="btn-edit"
									disabled={!selectedProfile}
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									<span>Edit</span>
								</button>
								<button
									onClick={() => setViewingLogsFor(event)}
									className="btn-logs"
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<span>View Logs</span>
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Edit Modal */}
			{editingEvent && (
				<div className="modal-overlay" onClick={() => setEditingEvent(null)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<EditEvent
							event={editingEvent}
							onClose={() => setEditingEvent(null)}
							onSuccess={handleEditSuccess}
							viewTimezone={viewTimezone}
						/>
					</div>
				</div>
			)}

			{/* Logs Modal */}
			{viewingLogsFor && (
				<div className="modal-overlay" onClick={() => setViewingLogsFor(null)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<EventLogs
							eventId={viewingLogsFor._id}
							eventTitle={viewingLogsFor.title}
							onClose={() => setViewingLogsFor(null)}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
