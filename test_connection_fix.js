const url = 'https://evolution-api-production-2413.up.railway.app';
const apiKey = 'wdb-copilot-secret-2024';
const instanceName = 'william';

async function forceActions() {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': apiKey
  };

  try {
    console.log('--- 1. Attempting Logout (DELETE /instance/logout/william) ---');
    const res = await fetch(`${url}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers
    });
    const data = await res.json();
    console.log('Logout response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error logging out:', err.message);
  }

  try {
    console.log('\n--- 2. Attempting Delete (DELETE /instance/delete/william) ---');
    const res = await fetch(`${url}/instance/delete/${instanceName}`, {
      method: 'DELETE',
      headers
    });
    const data = await res.json();
    console.log('Delete response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error deleting instance:', err.message);
  }
}

forceActions();
