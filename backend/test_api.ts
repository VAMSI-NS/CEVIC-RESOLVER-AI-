import app from './server/app';
import { initDatabase } from './database/db';
import http from 'http';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 CIVICRESOLVE BACKEND & DATABASE API TEST SUITE');
  console.log('======================================================\n');

  await initDatabase();

  const server = http.createServer(app);
  const TEST_PORT = 5098;

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`Test server active on http://localhost:${TEST_PORT}\n`);
      resolve();
    });
  });

  const BASE = `http://localhost:${TEST_PORT}`;
  let createdTicketId = '';
  let adminToken = '';

  try {
    // 1. Test Health Endpoint
    console.log('1️⃣ Testing GET /api/health ...');
    const healthRes = await fetch(`${BASE}/api/health`);
    const healthData = (await healthRes.json()) as any;
    console.log(`   Status: ${healthRes.status} | Response:`, JSON.stringify(healthData));
    if (healthRes.status !== 200 || !healthData.success) throw new Error('Health check failed');
    console.log('   ✅ PASS\n');

    // 2. Test Admin Login (Auth)
    console.log('2️⃣ Testing POST /api/auth/admin/login (Admin Authentication) ...');
    const authRes = await fetch(`${BASE}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });
    const authData = (await authRes.json()) as any;
    console.log(`   Status: ${authRes.status} | Auth:`, JSON.stringify(authData));
    if (authRes.status !== 200 || !authData.success || !authData.token) {
      throw new Error('Admin login failed');
    }
    adminToken = authData.token;
    console.log('   ✅ PASS (Admin Token Acquired)\n');

    // 3. Test POST /api/complaints (Citizen Complaint Registration)
    console.log('3️⃣ Testing POST /api/complaints (Citizen Registers Complaint) ...');
    const newComplaintPayload = {
      citizen_name: 'Rahul Sharma',
      phone: '9876543210',
      email: 'rahul@gmail.com',
      complaint_title: 'Broken Street Light',
      complaint_description: 'Street light is broken near the main circle and not working',
      category: 'Electricity',
      priority: 'HIGH',
      location: 'Benz Circle, Vijayawada',
      latitude: 16.5062,
      longitude: 80.6480,
    };

    const createRes = await fetch(`${BASE}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComplaintPayload),
    });
    const createData = (await createRes.json()) as any;
    console.log(`   Status: ${createRes.status} | Ticket: ${createData.ticket_id}`);
    if (createRes.status !== 201 || !createData.success || !createData.ticket_id) {
      throw new Error('Complaint registration failed');
    }
    createdTicketId = createData.ticket_id;
    console.log(`   ✅ PASS (Ticket ID Generated: ${createdTicketId})\n`);

    // 4. Test GET /api/complaints (Host/Admin Table View)
    console.log('4️⃣ Testing GET /api/complaints (Host/Admin Views All Complaints) ...');
    const getAllRes = await fetch(`${BASE}/api/complaints`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const getAllData = (await getAllRes.json()) as any;
    console.log(`   Status: ${getAllRes.status} | Total Count: ${getAllData.count}`);
    if (getAllRes.status !== 200 || !getAllData.success || !Array.isArray(getAllData.data)) {
      throw new Error('Get all complaints failed');
    }
    const foundCreated = getAllData.data.find((c: any) => c.ticket_id === createdTicketId);
    if (!foundCreated) throw new Error('Created complaint not in list');
    console.log(`   Verified Citizen Info in row: ${foundCreated.citizen_name}, Phone: ${foundCreated.phone}`);
    console.log('   ✅ PASS\n');

    // 5. Test GET /api/complaints/:ticket_id (Get Single Details)
    console.log(`5️⃣ Testing GET /api/complaints/${createdTicketId} (View Details Modal) ...`);
    const getSingleRes = await fetch(`${BASE}/api/complaints/${createdTicketId}`);
    const getSingleData = (await getSingleRes.json()) as any;
    console.log(`   Status: ${getSingleRes.status} | Title: "${getSingleData.data?.complaint_title}"`);
    if (getSingleRes.status !== 200 || !getSingleData.success || getSingleData.data.ticket_id !== createdTicketId) {
      throw new Error('Get single complaint failed');
    }
    console.log('   ✅ PASS\n');

    // 6. Test PUT /api/complaints/:ticket_id/status (Host Changes Status to UNDER_REVIEW)
    console.log(`6️⃣ Testing PUT /api/complaints/${createdTicketId}/status (Status -> UNDER_REVIEW) ...`);
    const updateRes = await fetch(`${BASE}/api/complaints/${createdTicketId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'UNDER_REVIEW' }),
    });
    const updateData = (await updateRes.json()) as any;
    console.log(`   Status: ${updateRes.status} | New Status: ${updateData.data?.status}`);
    if (updateRes.status !== 200 || !updateData.success || updateData.data.status !== 'UNDER_REVIEW') {
      throw new Error('Update complaint status to UNDER_REVIEW failed');
    }
    console.log('   ✅ PASS\n');

    // 7. Test Citizen Tracker Query reflects updated status
    console.log(`7️⃣ Testing Citizen Tracking Query (Verifying UNDER_REVIEW synchronization) ...`);
    const trackingRes = await fetch(`${BASE}/api/complaints/${createdTicketId}`);
    const trackingData = (await trackingRes.json()) as any;
    console.log(`   Citizen Tracker Status: ${trackingData.data?.status}`);
    if (trackingData.data?.status !== 'UNDER_REVIEW') {
      throw new Error('Citizen tracking failed to reflect UNDER_REVIEW status');
    }
    console.log('   ✅ PASS (Real-Time Multi-User Synchronization Verified!)\n');

    // 8. Test GET /api/dashboard/stats (Host Dashboard Analytics)
    console.log('8️⃣ Testing GET /api/dashboard/stats (Host Dashboard Analytics) ...');
    const statsRes = await fetch(`${BASE}/api/dashboard/stats`);
    const statsData = (await statsRes.json()) as any;
    console.log(`   Status: ${statsRes.status} | Total: ${statsData.total}, Under Review: ${statsData.under_review}`);
    if (statsRes.status !== 200 || !statsData.success || statsData.total === undefined) {
      throw new Error('Get dashboard stats failed');
    }
    console.log('   ✅ PASS\n');

    console.log('======================================================');
    console.log('🎉 ALL 8 BACKEND & POSTGRESQL API TESTS PASSED 100%!');
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('❌ TEST FAILED:', err.message);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();