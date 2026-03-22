const { google } = require('googleapis');
const path = require('path');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'service-account.json'),
  scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
});

const calendar = google.calendar({ version: 'v3', auth });

async function testCalendar() {
  try {
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 45);

    console.log("Fetching calendar for willdbga@gmail.com...");
    const response = await calendar.events.list({
      calendarId: 'willdbga@gmail.com',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    console.log("SUCCESS! Found events:", events?.length || 0);
    if (events && events.length > 0) {
      console.log("Primeiro evento:", events[0].summary, "em", events[0].start.dateTime || events[0].start.date);
    }
  } catch (error) {
    console.error("ERROR FETCHING CALENDAR:", error.message);
  }
}

testCalendar();
