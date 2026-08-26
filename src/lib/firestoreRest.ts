const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDxBfXwvrBt19dQbxqGYkVmFIl_S87VOdU";
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "william-site-43963";

const BASE_URL = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents";

function jsToFirestoreField(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(jsToFirestoreField),
      },
    };
  }
  if (typeof val === "object") {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = jsToFirestoreField(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function firestoreFieldToJs(field: any): any {
  if (!field) return null;
  if ("stringValue" in field) return field.stringValue;
  if ("booleanValue" in field) return field.booleanValue;
  if ("integerValue" in field) return parseInt(field.integerValue, 10);
  if ("doubleValue" in field) return field.doubleValue;
  if ("nullValue" in field) return null;
  if ("timestampValue" in field) return field.timestampValue;
  if ("arrayValue" in field) {
    return (field.arrayValue?.values || []).map(firestoreFieldToJs);
  }
  if ("mapValue" in field) {
    const obj: Record<string, any> = {};
    const fields = field.mapValue?.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      obj[k] = firestoreFieldToJs(v);
    }
    return obj;
  }
  return null;
}

export interface ClientMemory {
  clientName?: string;
  preferredPackage?: string;
  preferredDate?: string;
  budgetNotes?: string;
  summary?: string;
  totalInteractions?: number;
}

export interface ClientSession {
  history: { role: string; text: string }[];
  memory: ClientMemory;
  phoneNumber: string;
  pushName?: string;
  updatedAt?: string;
}

export async function getClientSession(phoneNumber: string): Promise<ClientSession | null> {
  try {
    const url = BASE_URL + "/whatsapp_sessions/" + phoneNumber + "?key=" + FIREBASE_API_KEY;
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) return null;

    const data = await resp.json();
    if (!data?.fields) return null;

    const session: ClientSession = {
      phoneNumber,
      history: firestoreFieldToJs(data.fields.history) || [],
      memory: firestoreFieldToJs(data.fields.memory) || {},
      pushName: firestoreFieldToJs(data.fields.pushName) || "",
      updatedAt: firestoreFieldToJs(data.fields.updatedAt) || data.updateTime,
    };

    return session;
  } catch (err: any) {
    console.warn("[Firestore REST] Error loading session:", err.message);
    return null;
  }
}

export async function saveClientSession(
  phoneNumber: string,
  history: { role: string; text: string }[],
  memory: ClientMemory,
  pushName?: string
): Promise<boolean> {
  try {
    const url = BASE_URL + "/whatsapp_sessions/" + phoneNumber + "?key=" + FIREBASE_API_KEY;
    const payload = {
      fields: {
        phoneNumber: jsToFirestoreField(phoneNumber),
        history: jsToFirestoreField(history),
        memory: jsToFirestoreField(memory),
        pushName: jsToFirestoreField(pushName || memory.clientName || ""),
        updatedAt: { timestampValue: new Date().toISOString() },
      },
    };

    const resp = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return resp.ok;
  } catch (err: any) {
    console.warn("[Firestore REST] Error saving session:", err.message);
    return false;
  }
}

export async function isPersonalContact(phoneNumber: string): Promise<boolean> {
  try {
    const url = BASE_URL + "/whatsapp_personal_contacts/" + phoneNumber + "?key=" + FIREBASE_API_KEY;
    const resp = await fetch(url, { cache: "no-store" });
    return resp.ok;
  } catch (err: any) {
    console.warn("[Firestore REST] Error checking personal contact:", err.message);
    return false;
  }
}

export async function saveLead(phoneNumber: string, payloadStr: string): Promise<boolean> {
  try {
    const url = BASE_URL + "/leads?key=" + FIREBASE_API_KEY;
    const payload = {
      fields: {
        source: jsToFirestoreField("whatsapp"),
        phoneNumber: jsToFirestoreField(phoneNumber),
        payload: jsToFirestoreField(payloadStr),
        createdAt: { timestampValue: new Date().toISOString() },
      },
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return resp.ok;
  } catch (err: any) {
    console.warn("[Firestore REST] Error saving lead:", err.message);
    return false;
  }
}

export async function getSiteConfig(): Promise<any> {
  try {
    const url = BASE_URL + "/settings/site_config?key=" + FIREBASE_API_KEY;
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data?.fields) return null;
    return firestoreFieldToJs({ mapValue: { fields: data.fields } });
  } catch (err: any) {
    return null;
  }
}
