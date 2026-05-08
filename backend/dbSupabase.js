// dbSupabase.js
const supabase = require('./supabaseClient');

/**
 * Seed the `members` table if empty.
 */
async function seedMembers() {
  const { data, error, count } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('Supabase seed error (select):', error);
    return;
  }

  if (count === 0) {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const members = [
      { name: 'Santhosha', payment_status: 'Not Paid', month: currentMonth },
      { name: 'Padma tadam', payment_status: 'Not Paid', month: currentMonth },
      { name: 'Lalitha', payment_status: 'Not Paid', month: currentMonth },
      { name: 'Mamatha', payment_status: 'Not Paid', month: currentMonth },
      { name: 'Radhika', payment_status: 'Not Paid', month: currentMonth },
      { name: 'Haritha', payment_status: 'Not Paid', month: currentMonth },
      { name: 'Swathi', payment_status: 'Not Paid', month: currentMonth },
      { name: 'Nirmala', payment_status: 'Not Paid', month: currentMonth },
      { name: 'Chandana', payment_status: 'Not Paid', month: currentMonth },
      { name: 'Padma mora', payment_status: 'Not Paid', month: currentMonth },
    ];

    const { error: insertErr } = await supabase.from('members').insert(members);
    if (insertErr) {
      console.error('Supabase seed error (insert):', insertErr);
    } else {
      console.log('Supabase seeded 10 members.');
    }
  }
}

/**
 * CRUD helpers used by the API routes.
 */
async function getAllMembers() {
  const { data, error } = await supabase.from('members').select('*');
  if (error) throw error;
  return data;
}

async function updateMemberStatus(id, status) {
  const { error } = await supabase
    .from('members')
    .update({ payment_status: status })
    .eq('id', id);
  if (error) throw error;
}

async function updateAllMembers(updates) {
    const { error } = await supabase
        .from('members')
        .update(updates)
        .neq('id', 0); // Update all
    if (error) throw error;
}

async function addMember(name, month) {
    const { data, error } = await supabase
        .from('members')
        .insert([{ name, payment_status: 'Not Paid', month }])
        .select();
    if (error) throw error;
    return data[0];
}

module.exports = {
  supabase,
  seedMembers,
  getAllMembers,
  updateMemberStatus,
  updateAllMembers,
  addMember
};
