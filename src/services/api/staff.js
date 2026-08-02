// Manager-only operations: viewing/updating staff profiles and writing
// to the audit trail. RLS on the `profiles` and `staff_logs` tables
// already restricts these to users with role = 'manager' — this file
// just wraps the queries, it isn't the security boundary itself.
import { supabase } from '../supabaseClient'

export async function fetchStaffProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, status, created_at')
    .in('role', ['user', 'staff', 'manager'])
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function updateStaffProfile(id, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function logStaffAction({ action, targetProfileId, performedBy }) {
  const { error } = await supabase
    .from('staff_logs')
    .insert([{ action, target_profile_id: targetProfileId, performed_by: performedBy }])

  if (error) throw new Error(error.message)
}

export async function fetchStaffLogs() {
  const { data, error } = await supabase
    .from('staff_logs')
    .select('id, action, timestamp, target_profile_id, performed_by')
    .order('timestamp', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data
}