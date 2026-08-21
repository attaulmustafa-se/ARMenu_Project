import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@google/model-viewer';
import QRCode from 'qrcode';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function modelUrl(value) {
	if (!value) return '';
	if (value.startsWith('http')) return value;
	return `/ARModels/${value.split('/').pop()}`;
}

function App() {
	const [items, setItems] = useState([]);
	const [selected, setSelected] = useState(null);
	const [message, setMessage] = useState('Connecting to menu API...');
	const [isAdding, setIsAdding] = useState(false);
	const [isAddingAll, setIsAddingAll] = useState(false);
	const [theme, setTheme] = useState('dark');
	const [qrCode, setQrCode] = useState('');

	async function loadMenu() {
		setMessage('Loading menu...');
		try {
			const response = await fetch(`${API_URL}/get`);
			if (!response.ok) throw new Error(`API returned ${response.status}`);
			const data = await response.json();
			const nextItems = data.fullmenu || [];
			setItems(nextItems);
			setSelected((current) => nextItems.find((item) => item._id === current?._id) || nextItems[0] || null);
			setMessage(`${nextItems.length} menu item${nextItems.length === 1 ? '' : 's'} loaded`);
		} catch (error) {
			setMessage(`Unable to reach API: ${error.message}`);
		}
	}

	async function addSample() {
		setIsAdding(true);
		try {
			const response = await fetch(`${API_URL}/add`);
			if (!response.ok) throw new Error(`API returned ${response.status}`);
			await loadMenu();
		} catch (error) {
			setMessage(`Could not add sample: ${error.message}`);
		} finally {
			setIsAdding(false);
		}
	}

	async function addAllModels() {
		setIsAddingAll(true);
		try {
			const response = await fetch(`${API_URL}/add-all`);
			if (!response.ok) throw new Error(`API returned ${response.status}`);
			await loadMenu();
		} catch (error) {
			setMessage(`Could not add models: ${error.message}`);
		} finally {
			setIsAddingAll(false);
		}
	}

	async function removeItem(event, item) {
		event.stopPropagation();
		try {
			const response = await fetch(`${API_URL}/delete/${item._id}`, { method: 'DELETE' });
			if (!response.ok) throw new Error(`API returned ${response.status}`);
			await loadMenu();
		} catch (error) {
			setMessage(`Could not remove item: ${error.message}`);
		}
	}

	async function removeDuplicates() {
		try {
			const response = await fetch(`${API_URL}/delete-duplicates`, { method: 'DELETE' });
			if (!response.ok) throw new Error(`API returned ${response.status}`);
			await loadMenu();
		} catch (error) {
			setMessage(`Could not clean duplicates: ${error.message}`);
		}
	}

	useEffect(() => { loadMenu(); }, []);

	useEffect(() => {
		if (!selected) {
			setQrCode('');
			return;
		}

		QRCode.toDataURL(window.location.href, { width: 180, margin: 1 })
			.then(setQrCode)
			.catch(() => setQrCode(''));
	}, [selected]);

	return (
		<main className={`shell ${theme}-theme`}>
			<header className="topbar">
				<div className="brand"><span>AR</span> MENU / TEST CONSOLE</div>
				<div className="header-actions"><button className="theme-toggle" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button><div className="api-state"><i /> BACKEND :3000</div></div>
			</header>

			<section className="hero">
				<p className="kicker">Augmented dining / live data</p>
				<h1>Explore the<br /><em>menu in 3D.</em></h1>
				<p className="intro">A small control room for testing menu records and their associated AR assets.</p>
			</section>

			<section className="console">
				<aside className="menu-column">
					<div className="section-title"><div><p className="kicker">01 / records</p><h2>Menu items</h2></div><button onClick={loadMenu} title="Refresh menu">↻</button></div>
					<p className="message">{message}</p>
					<div className="items">
						{items.map((item, index) => <button className={`item ${selected?._id === item._id ? 'active' : ''}`} onClick={() => setSelected(item)} key={item._id || index}><span className="index">{String(index + 1).padStart(2, '0')}</span><span><strong>{item.name}</strong><small>{item.isAvailable ? 'Available' : 'Unavailable'}</small></span><b>${Number(item.price).toFixed(2)}</b><span className="item-remove" role="button" tabIndex="0" onClick={(event) => removeItem(event, item)} title={`Remove ${item.name}`} aria-label={`Remove ${item.name}`}>×</span></button>)}
						{!items.length && <p className="empty">No records found. Use the button below to test `GET /add`.</p>}
					</div>
					<button className="add" onClick={addSample} disabled={isAdding || isAddingAll}>{isAdding ? 'Adding...' : '+ Add sample dish'}</button>
					<button className="add secondary" onClick={addAllModels} disabled={isAdding || isAddingAll}>{isAddingAll ? 'Adding models...' : '+ Add all model samples'}</button>
					<button className="add secondary danger" onClick={removeDuplicates}>− Remove duplicates</button>
				</aside>

				<section className="preview-column">
					<div className="preview-head"><span>02 / model viewer</span><span className="live">● LIVE</span></div>
					<div className="stage">
						<div className="grid" />
						{selected ? <><model-viewer src={modelUrl(selected.URLmodel)} alt={`${selected.name} 3D model`} camera-controls auto-rotate ar ar-modes="webxr scene-viewer quick-look" xr-environment shadow-intensity="1"><button className="ar-button" slot="ar-button">View in your space</button></model-viewer><div className="caption"><small>Selected model</small><strong>{selected.name}</strong></div></> : <div className="placeholder"><span>◎</span><p>Load a menu item<br />to inspect its model</p></div>}
					</div>
					<div className="facts">{selected ? <><div><small>Price</small><strong>${Number(selected.price).toFixed(2)}</strong></div><div><small>Status</small><strong className={selected.isAvailable ? 'green' : 'orange'}>{selected.isAvailable ? 'In service' : 'Paused'}</strong></div><div><small>Model path</small><strong>{selected.URLmodel || 'Not provided'}</strong></div></> : <p>Select a record to see its API data.</p>}</div>
					{selected && qrCode && <div className="qr-panel"><img src={qrCode} alt={`QR code to open ${selected.name}`} /><div><small>Scan to open this menu</small><strong>{selected.name}</strong><p>Open this page on your phone, then tap “View in your space”.</p></div></div>}
				</section>
			</section>
		</main>
	);
}

createRoot(document.getElementById('root')).render(<App />);
