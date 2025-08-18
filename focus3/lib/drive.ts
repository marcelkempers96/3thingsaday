export async function driveUploadAppData(token: string, filename: string, json: unknown): Promise<void> {
	const metadata = { name: filename, parents: ['appDataFolder'] };
	const boundary = 'foo_bar_baz_' + Math.random().toString(36).slice(2);
	const body =
		`--${boundary}\r\n` +
		`Content-Type: application/json; charset=UTF-8\r\n\r\n` +
		`${JSON.stringify(metadata)}\r\n` +
		`--${boundary}\r\n` +
		`Content-Type: application/json\r\n\r\n` +
		`${JSON.stringify(json)}\r\n` +
		`--${boundary}--`;
	const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
		body
	});
	if (!resp.ok) throw new Error('Drive upload failed ' + resp.status);
}

export async function driveListAppData(token: string): Promise<{ id: string; name: string }[]> {
	const resp = await fetch('https://www.googleapis.com/drive/v3/files?q=\'appDataFolder\' in parents and trashed=false&fields=files(id,name)', {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!resp.ok) throw new Error('Drive list failed ' + resp.status);
	const data = await resp.json();
	return data.files || [];
}

export async function driveDownloadAppData(token: string, fileId: string): Promise<any> {
	const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { Authorization: `Bearer ${token}` } });
	if (!resp.ok) throw new Error('Drive download failed ' + resp.status);
	return await resp.json();
}