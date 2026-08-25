const url = 'https://evolution-api-production-2413.up.railway.app';
const apiKey = 'wdb-copilot-secret-2024';
const instanceName = 'william';
const instanceToken = '481FDD16EDE9-4CF7-8B0B-34CEBBD819D3';

async function recreateInstance() {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': apiKey
  };

  try {
    console.log('--- 1. DELETING existing bugged instance "william" ---');
    const deleteRes = await fetch(`${url}/instance/delete/${instanceName}`, {
      method: 'DELETE',
      headers
    });
    const deleteData = await deleteRes.json();
    console.log('Delete response:', JSON.stringify(deleteData, null, 2));
  } catch (err) {
    console.error('Error deleting instance:', err.message);
  }

  // Wait 2 seconds for clean deletion in Evolution API DB
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    console.log('\n--- 2. CREATING fresh instance "william" ---');
    const createRes = await fetch(`${url}/instance/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        instanceName: instanceName,
        token: instanceToken,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      })
    });
    const createData = await createRes.json();
    console.log('Create response:', JSON.stringify(createData, null, 2));
  } catch (err) {
    console.error('Error creating instance:', err.message);
    return;
  }

  // Wait 2 seconds for creation to settle
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    console.log('\n--- 3. SETTING UP Webhook ---');
    const webhookRes = await fetch(`${url}/webhook/set/${instanceName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        enabled: true,
        url: 'https://us-central1-williamdelbarrio-5a342.cloudfunctions.net/whatsappWebhook',
        headers: {},
        webhookByEvents: true,
        webhookBase64: false,
        events: ['MESSAGES_UPSERT']
      })
    });
    const webhookData = await webhookRes.json();
    console.log('Webhook set response:', JSON.stringify(webhookData, null, 2));
  } catch (err) {
    console.error('Error setting webhook:', err.message);
  }

  try {
    console.log('\n--- 4. CONFIGURING Instance Settings ---');
    const settingsRes = await fetch(`${url}/settings/set/${instanceName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        rejectCall: false,
        msgCall: '',
        groupsIgnore: true,
        alwaysOnline: false,
        readMessages: false,
        readStatus: false,
        syncFullHistory: false
      })
    });
    const settingsData = await settingsRes.json();
    console.log('Settings set response:', JSON.stringify(settingsData, null, 2));
  } catch (err) {
    console.error('Error setting configuration:', err.message);
  }

  try {
    console.log('\n--- 5. VERIFYING Final Instance Connection State ---');
    const stateRes = await fetch(`${url}/instance/connectionState/${instanceName}`, { headers });
    const stateData = await stateRes.json();
    console.log('Final Connection State:', JSON.stringify(stateData, null, 2));
  } catch (err) {
    console.error('Error checking final state:', err.message);
  }
}

recreateInstance();
