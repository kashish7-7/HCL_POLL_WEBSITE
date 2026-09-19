// Browser-persistent UUID voter identifier for vote deduplication

export function getVoterId() {
  let voterId = localStorage.getItem('pulsevote_voter_id');
  if (!voterId) {
    voterId = 'voter_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('pulsevote_voter_id', voterId);
  }
  return voterId;
}
