-- supabase/dummy_data.sql
-- IMPORTANT: Run this file in your Supabase SQL Editor.
-- NOTE: We insert a bare-bones user into auth.users. The `handle_new_user` trigger will automatically populate `public.profiles`.

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.com', '$2a$10$wE9s', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Test Admin"}')
ON CONFLICT (id) DO NOTHING;

-- Because of the trigger on `auth.users`, the profile for '11111111...' was created automatically. 
-- Let's update that profile to be an admin so they can test admin features if needed.
UPDATE public.profiles
SET role = 'admin'
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Dummy Campaigns
INSERT INTO public.campaigns (id, slug, title, description, story, location, region, target_amount, raised_amount, currency, status, cover_image_url, beneficiaries_count, created_by)
VALUES
  (
    '22222222-2222-2222-2222-222222222221', 
    'water-well-for-tamale', 
    'Clean Water Well for Tamale Community', 
    'Provide a sustainable water source for 500+ residents.', 
    '<p>This community has struggled with water shortages for over 5 years. This campaign will fund the digging of a deep borehole and installation of a solar-powered pump.</p>', 
    'Tamale', 
    'Northern Region', 
    15000.00, 
    5500.00, 
    'GHS', 
    'active', 
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1000&auto=format&fit=crop', 
    500, 
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'orphan-school-supplies-bolga', 
    'School Supplies for Orphans', 
    'Equip 100 orphans with learning materials.', 
    '<p>Education is the key. We are providing backpacks, notebooks, and stationary for 100 orphans returning to school.</p>', 
    'Bolgatanga', 
    'Upper East Region', 
    8000.00, 
    1200.00, 
    'GHS', 
    'active', 
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop', 
    100, 
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '22222222-2222-2222-2222-222222222223', 
    'food-packages-yendi', 
    'Ramadan Food Packages in Yendi', 
    'Deliver staple foods to families in need.', 
    '<p>Each package contains rice, oil, dates, and maize to sustain a family of 5 for exactly one month.</p>', 
    'Yendi', 
    'Northern Region', 
    20000.00, 
    20000.00, 
    'GHS', 
    'funded', 
    'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?q=80&w=1000&auto=format&fit=crop', 
    250, 
    '11111111-1111-1111-1111-111111111111'
  )
ON CONFLICT (slug) DO NOTHING;

-- Dummy Contributions
INSERT INTO public.contributions (user_id, campaign_id, amount, currency, paystack_reference, status, message, anonymous)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 500.00, 'GHS', 'REF_TEST_101', 'success', 'May Allah accept this.', false),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 5000.00, 'GHS', 'REF_TEST_102', 'success', '', true),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1200.00, 'GHS', 'REF_TEST_103', 'success', 'For the kids', false)
ON CONFLICT (paystack_reference) DO NOTHING;
