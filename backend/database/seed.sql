-- ============================================================
-- CivicResolve AI - Seed SQL Data (Optional Testing Data)
-- ============================================================

INSERT INTO complaints (
    ticket_id, citizen_name, phone, email, complaint_title, 
    complaint_description, category, priority, status, location, 
    latitude, longitude, authority, image_url, created_at, updated_at
) VALUES 
(
    'CR-2026-004821', 'Rahul Sharma', '9876543210', 'rahul.sharma@example.com',
    'Large pothole near college bus stop',
    'There is a huge pothole near the college bus stop and vehicles are struggling to pass. Two-wheelers have already fallen due to this.',
    'Roads', 'HIGH', 'ASSIGNED', 'Main Road, Near College Bus Stop',
    12.9716, 77.5946, 'Municipal Roads & Infrastructure Department', NULL,
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'
),
(
    'CR-2026-004712', 'Priya Patel', '9876543211', 'priya.patel@example.com',
    'Overflowing garbage bin on 4th cross',
    'The community waste bin has been overflowing for 3 days. Stray dogs and cows are scattering trash all over the road.',
    'Garbage', 'MEDIUM', 'IN_PROGRESS', 'City Market Area, Gandhi Nagar',
    12.9726, 77.5956, 'Solid Waste Management Department', NULL,
    NOW() - INTERVAL '5 hours', NOW() - INTERVAL '2 hours'
),
(
    'CR-2026-004715', 'Anil Kumar', '9876543212', 'anil.k@example.com',
    'Open manhole on pedestrian pathway',
    'The storm water drain cover is completely broken and open. It poses a severe risk of falling for pedestrians, especially children.',
    'Drainage', 'CRITICAL', 'REGISTERED', 'Residency Road, Near Post Office',
    12.9736, 77.5966, 'Storm Water & Drainage Department', NULL,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
),
(
    'CR-2026-004820', 'Deepa Nair', '9876543213', 'deepa.nair@example.com',
    'Streetlights not working on entire block',
    'All streetlights from pole 12 to pole 28 have been dark for 4 consecutive nights. It has become unsafe to walk after 7 PM.',
    'Streetlights', 'HIGH', 'UNDER_REVIEW', 'MG Road, Near Shopping Complex',
    12.9746, 77.5976, 'Electrical & Lighting Department', NULL,
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
),
(
    'CR-2026-004650', 'Suresh Reddy', '9876543214', 'suresh.reddy@example.com',
    'Contaminated brown tap water supply',
    'Tap water supplied in our apartment complex has been coming with brown residue and bad odor for the past 24 hours.',
    'Water', 'HIGH', 'RESOLVED', 'Park Road, Near City Park',
    12.9756, 77.5986, 'Water Supply & Sewerage Board', NULL,
    NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'
)
ON CONFLICT (ticket_id) DO NOTHING;