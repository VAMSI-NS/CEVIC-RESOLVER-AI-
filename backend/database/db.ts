import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

const { Pool } = pg;

// Define complaint row interface for TypeScript
export interface ComplaintRow {
  id: number;
  ticket_id: string;
  citizen_name: string | null;
  phone: string | null;
  email: string | null;
  complaint_title: string;
  complaint_description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  authority: string | null;
  image_url: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

let pool: pg.Pool | null = null;
let usePostgres = false;

// Fallback local storage file if PostgreSQL is not connected locally
const LOCAL_STORAGE_FILE = path.resolve(process.cwd(), 'backend/database/local_complaints.json');

// Memory cache for fallback mode
let localDatabase: ComplaintRow[] = [];

/** Load local complaints file if exists */
function loadLocalDatabase(): void {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
      localDatabase = JSON.parse(data);
    } else {
      localDatabase = [];
      saveLocalDatabase();
    }
  } catch (err) {
    console.error('[DB] Warning: Could not load local storage file:', err);
    localDatabase = [];
  }
}

/** Save local complaints to file */
function saveLocalDatabase(): void {
  try {
    const dir = path.dirname(LOCAL_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(localDatabase, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Warning: Could not save to local storage file:', err);
  }
}

/**
 * Initialize Database Connection and create tables
 */
export async function initDatabase(): Promise<void> {
  loadLocalDatabase();

  if (config.databaseUrl && config.databaseUrl.trim() !== '') {
    try {
      console.log('[DB] Connecting to PostgreSQL Database...');
      const isSsl = config.databaseUrl.includes('sslmode=require') || 
                    config.databaseUrl.includes('neon.tech') || 
                    config.databaseUrl.includes('supabase.co') ||
                    config.databaseUrl.includes('render.com') ||
                    config.databaseUrl.includes('railway.app');

      pool = new Pool({
        connectionString: config.databaseUrl,
        ssl: isSsl ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      const client = await pool.connect();
      try {
        await client.query('SELECT NOW()');
        usePostgres = true;
        console.log('[DB] ? PostgreSQL Connected successfully!');

        // Run table schema
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
          await client.query(schemaSql);
          console.log('[DB] ? Complaints table schema initialized in PostgreSQL.');
        }
      } finally {
        client.release();
      }
      return;
    } catch (err: any) {
      console.warn(`[DB] ⚠️ PostgreSQL connection failed (${err.message}). Using local SQL persistence storage.`);
      usePostgres = false;
      pool = null;
    }
  } else {
    console.log('[DB] ℹ️ DATABASE_URL not set. Operating in local SQL persistent storage mode.');
  }

  // Fallback initial sample data if local database is empty
  if (localDatabase.length === 0) {
    seedLocalFallbackData();
  }
}

/** Seed local fallback data for immediate testing */
function seedLocalFallbackData(): void {
  const now = new Date();
  localDatabase = [
    {
      id: 1,
      ticket_id: 'CR-2026-004821',
      citizen_name: 'Rahul Sharma',
      phone: '9876543210',
      email: 'rahul.sharma@example.com',
      complaint_title: 'Large pothole near college bus stop',
      complaint_description: 'There is a huge pothole near the college bus stop and vehicles are struggling to pass. Two-wheelers have already fallen due to this.',
      category: 'Roads',
      priority: 'HIGH',
      status: 'ASSIGNED',
      location: 'Main Road, Near College Bus Stop',
      latitude: 12.9716,
      longitude: 77.5946,
      authority: 'Municipal Roads & Infrastructure Department',
      image_url: null,
      created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
    },
    {
      id: 2,
      ticket_id: 'CR-2026-004712',
      citizen_name: 'Priya Patel',
      phone: '9876543211',
      email: 'priya.patel@example.com',
      complaint_title: 'Overflowing garbage bin on 4th cross',
      complaint_description: 'The community waste bin has been overflowing for 3 days. Stray dogs and cows are scattering trash all over the road.',
      category: 'Garbage',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      location: 'City Market Area, Gandhi Nagar',
      latitude: 12.9726,
      longitude: 77.5956,
      authority: 'Solid Waste Management Department',
      image_url: null,
      created_at: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 3,
      ticket_id: 'CR-2026-004715',
      citizen_name: 'Anil Kumar',
      phone: '9876543212',
      email: 'anil.k@example.com',
      complaint_title: 'Open manhole on pedestrian pathway',
      complaint_description: 'The storm water drain cover is completely broken and open. It poses a severe risk of falling for pedestrians, especially children.',
      category: 'Drainage',
      priority: 'CRITICAL',
      status: 'REGISTERED',
      location: 'Residency Road, Near Post Office',
      latitude: 12.9736,
      longitude: 77.5966,
      authority: 'Storm Water & Drainage Department',
      image_url: null,
      created_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 4,
      ticket_id: 'CR-2026-004820',
      citizen_name: 'Deepa Nair',
      phone: '9876543213',
      email: 'deepa.nair@example.com',
      complaint_title: 'Streetlights not working on entire block',
      complaint_description: 'All streetlights from pole 12 to pole 28 have been dark for 4 consecutive nights. It has become unsafe to walk after 7 PM.',
      category: 'Streetlights',
      priority: 'HIGH',
      status: 'UNDER_REVIEW',
      location: 'MG Road, Near Shopping Complex',
      latitude: 12.9746,
      longitude: 77.5976,
      authority: 'Electrical & Lighting Department',
      image_url: null,
      created_at: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
    },
    {
      id: 5,
      ticket_id: 'CR-2026-004650',
      citizen_name: 'Suresh Reddy',
      phone: '9876543214',
      email: 'suresh.reddy@example.com',
      complaint_title: 'Contaminated brown tap water supply',
      complaint_description: 'Tap water supplied in our apartment complex has been coming with brown residue and bad odor for the past 24 hours.',
      category: 'Water',
      priority: 'HIGH',
      status: 'RESOLVED',
      location: 'Park Road, Near City Park',
      latitude: 12.9756,
      longitude: 77.5986,
      authority: 'Water Supply & Sewerage Board',
      image_url: null,
      created_at: new Date(now.getTime() - 96 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    },
  ];
  saveLocalDatabase();
}

/**
 * Execute SQL Query
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> {
  // If PostgreSQL is active, route directly to pg pool
  if (usePostgres && pool) {
    const res = await pool.query(text, params);
    return { rows: res.rows as T[], rowCount: res.rowCount ?? res.rows.length };
  }

  // Local fallback SQL simulator
  return executeFallbackQuery<T>(text, params);
}

/** Local query engine for SQL fallback */
function executeFallbackQuery<T = any>(sql: string, params: any[]): { rows: T[]; rowCount: number } {
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT ALL
  if (normalizedSql.toUpperCase().startsWith('SELECT * FROM COMPLAINTS') && !normalizedSql.toUpperCase().includes('WHERE')) {
    let result = [...localDatabase];
    if (normalizedSql.toUpperCase().includes('ORDER BY CREATED_AT DESC')) {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return { rows: result as unknown as T[], rowCount: result.length };
  }

  // 2. SELECT BY TICKET ID OR ID
  if (normalizedSql.toUpperCase().includes('WHERE TICKET_ID = $1') || normalizedSql.toUpperCase().includes('WHERE UPPER(TICKET_ID) = UPPER($1)')) {
    const ticketId = String(params[0]).toUpperCase();
    const found = localDatabase.find((c) => c.ticket_id.toUpperCase() === ticketId || String(c.id) === ticketId);
    return { rows: (found ? [found] : []) as unknown as T[], rowCount: found ? 1 : 0 };
  }

  // 3. INSERT COMPLAINT
  if (normalizedSql.toUpperCase().startsWith('INSERT INTO COMPLAINTS')) {
    const newId = localDatabase.length > 0 ? Math.max(...localDatabase.map((c) => c.id)) + 1 : 1;
    const nowIso = new Date().toISOString();
    const [
      ticket_id, citizen_name, phone, email, complaint_title,
      complaint_description, category, priority, status, location,
      latitude, longitude, authority, image_url
    ] = params;

    const newRow: ComplaintRow = {
      id: newId,
      ticket_id: String(ticket_id),
      citizen_name: citizen_name || null,
      phone: phone || null,
      email: email || null,
      complaint_title: String(complaint_title),
      complaint_description: String(complaint_description),
      category: String(category),
      priority: String(priority || 'MEDIUM'),
      status: String(status || 'REGISTERED'),
      location: String(location),
      latitude: latitude !== undefined && latitude !== null ? Number(latitude) : null,
      longitude: longitude !== undefined && longitude !== null ? Number(longitude) : null,
      authority: authority || 'General Civic Authority',
      image_url: image_url || null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    localDatabase.unshift(newRow);
    saveLocalDatabase();
    return { rows: [newRow] as unknown as T[], rowCount: 1 };
  }

  // 4. UPDATE STATUS
  if (normalizedSql.toUpperCase().startsWith('UPDATE COMPLAINTS SET STATUS = $1')) {
    const newStatus = params[0];
    const ticketId = String(params[1]).toUpperCase();
    const idx = localDatabase.findIndex((c) => c.ticket_id.toUpperCase() === ticketId || String(c.id) === ticketId);

    if (idx >= 0) {
      localDatabase[idx].status = newStatus;
      localDatabase[idx].updated_at = new Date().toISOString();
      saveLocalDatabase();
      return { rows: [localDatabase[idx]] as unknown as T[], rowCount: 1 };
    }
    return { rows: [] as unknown as T[], rowCount: 0 };
  }

  // 5. DELETE COMPLAINT
  if (normalizedSql.toUpperCase().startsWith('DELETE FROM COMPLAINTS WHERE TICKET_ID = $1')) {
    const ticketId = String(params[0]).toUpperCase();
    const prevLen = localDatabase.length;
    localDatabase = localDatabase.filter((c) => c.ticket_id.toUpperCase() !== ticketId && String(c.id) !== ticketId);
    saveLocalDatabase();
    return { rows: [] as unknown as T[], rowCount: prevLen - localDatabase.length };
  }

  // 6. DASHBOARD STATS AGGREGATION
  if (normalizedSql.toUpperCase().includes('COUNT(*)') || normalizedSql.toUpperCase().includes('DASHBOARD')) {
    return { rows: localDatabase as unknown as T[], rowCount: localDatabase.length };
  }

  return { rows: [] as unknown as T[], rowCount: 0 };
}

export function isConnectedToPostgres(): boolean {
  return usePostgres;
}

export { pool };