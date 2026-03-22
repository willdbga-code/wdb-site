import { google } from 'googleapis';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: SCOPES,
});

export async function getUpcomingAvailability() {
  try {
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Look up to 45 days ahead
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 45);

    const response = await calendar.events.list({
      calendarId: 'willdbga@gmail.com', // William's primary email calendar
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    
    if (!events || events.length === 0) {
      return "Agenda totalmente livre para os próximos 45 dias. Qualquer data é válida.";
    }

    const busyDays = events.map(event => {
      // Handle full-day events (date) vs time-specific events (dateTime)
      if (event.start?.date) {
         return `- Ocupado O DIA TODO no dia ${event.start.date}`;
      }
      const start = new Date(event.start?.dateTime as string);
      const end = new Date(event.end?.dateTime as string);
      return `- Ocupado no dia ${start.toLocaleDateString('pt-BR')} das ${start.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} até ${end.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    });

    return `Eventos ocupados na agenda do William nos próximos 45 dias:\n` + busyDays.join('\n') + `\n\n(Aviso para a IA: Qualquer data ou horário que não esteja na lista acima significa que o William está LIVRE e você pode oferecer).`;

  } catch (error: any) {
    console.error('Error fetching calendar:', error.message);
    return "Aviso para a IA: Não foi possível acessar a agenda neste segundo. Se o cliente pedir uma data, diga que precisamos confirmar disponibilidade no WhatsApp na etapa seguinte.";
  }
}
