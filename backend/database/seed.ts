import { initDatabase, query } from './db';

async function runSeed() {
  console.log('--- Starting Database Seeding ---');
  await initDatabase();

  const seedData = [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ];

  for (const item of seedData) {
    try {
      const sql = `
        INSERT INTO complaints (
          ticket_id, citizen_name, phone, email, complaint_title,
          complaint_description, category, priority, status, location,
          latitude, longitude, authority, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `;
      await query(sql, [
        item.ticket_id,
        item.citizen_name,
        item.phone,
        item.email,
        item.complaint_title,
        item.complaint_description,
        item.category,
        item.priority,
        item.status,
        item.location,
        item.latitude,
        item.longitude,
        item.authority,
        null,
      ]);
      console.log(`+ Seeded complaint: ${item.ticket_id} - ${item.complaint_title}`);
    } catch (err: any) {
      console.log(`- Note for ${item.ticket_id}: ${err.message}`);
    }
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});