import { useState } from 'react';
import { ProfileSelector } from './components/ProfileSelector';
import { CreateProfile } from './components/CreateProfile';
import { CreateEvent } from './components/CreateEvent';
import { EventList } from './components/EventList';
import { ThemeToggle } from './components/ThemeToggle';
import './App.css';

function App() {
	const [showCreateProfile, setShowCreateProfile] = useState(false);

	return (
		<div className="app">
			<header className="app-header">
				<div className="header-content">
					<div className="header-title">
						<h1>Event Management</h1>
						<p className="header-subtitle">Create and manage events across multiple timezones</p>
					</div>
					<div className="header-actions">
						<ThemeToggle />
						<ProfileSelector onCreateProfile={() => setShowCreateProfile(true)} />
					</div>
				</div>
			</header>

			<main className="app-main">
				<div className="main-grid">
					<div className="left-panel">
						<CreateEvent />
					</div>
					<div className="right-panel">
						<EventList />
					</div>
				</div>
			</main>
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
}

export default App;
