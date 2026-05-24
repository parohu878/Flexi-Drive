require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  
  // 1. Get first user
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .limit(2);
    
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }
  
  console.log('Found users:', users.length);
  
  // 2. Get first vehicle
  const { data: vehicles, error: vehicleError } = await supabase
    .from('vehicles')
    .select('*')
    .limit(1);
    
  if (vehicleError) {
    console.error('Error fetching vehicles:', vehicleError);
    return;
  }
  
  console.log('Found vehicles:', vehicles.length);

  if (users.length === 0 || vehicles.length === 0) {
    console.log('Cannot perform insert test: missing users or vehicles in database.');
    return;
  }

  const user = users[0];
  const vehicle = vehicles[0];
  
  // Try inserting a temporary booking
  console.log('Inserting test booking...');
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert([{
      inquilino_id: user.id,
      propietario_id: vehicle.propietario_id || user.id,
      vehicle_id: vehicle.id,
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 3600000).toISOString(),
      precio_total: 10,
      codigo: 'TEST-STATUS',
      estado: 'confirmada'
    }])
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting test booking:', insertError);
    return;
  }

  console.log('Test booking inserted:', booking.id);

  // Try updating to 'en curs'
  console.log('Attempting to update status to "en curs"...');
  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({ estado: 'en curs' })
    .eq('id', booking.id)
    .select();

  if (updateError) {
    console.error('Error updating status to "en curs":', updateError);
  } else {
    console.log('Successfully updated status to "en curs":', updated);
  }

  // Delete test booking
  console.log('Deleting test booking...');
  const { error: deleteError } = await supabase
    .from('bookings')
    .delete()
    .eq('id', booking.id);
    
  if (deleteError) {
    console.error('Error deleting test booking:', deleteError);
  } else {
    console.log('Deleted test booking.');
  }
}

test();
