// Utility to normalize role identifiers (numeric IDs or variant strings)
export const ROLE_MAP_BY_ID = {
  '1': 'ticket_creator',
  '2': 'it_team',
  '3': 'department_head'
};

export function normalizeRole(input) {
  if (input === null || input === undefined) return null;
  const s = String(input).trim().toLowerCase();

  // Direct numeric mapping
  if (ROLE_MAP_BY_ID[s]) return ROLE_MAP_BY_ID[s];

  // Common string variants
  if (s === 'ticket_creator' || (s.includes('ticket') && s.includes('creator'))) return 'ticket_creator';
  if (s === 'it_team' || (s.includes('it') && s.includes('team'))) return 'it_team';
  if (s === 'department_head' || s.includes('head') || s.includes('department')) return 'department_head';

  // Fallback: return original string (caller should handle unexpected values)
  return s;
}

export function roleLabel(role) {
  switch (role) {
    case 'ticket_creator':
      return 'Ticket Creator';
    case 'it_team':
      return 'IT Team';
    case 'department_head':
      return 'IT Head';
    default:
      return 'User';
  }
}
