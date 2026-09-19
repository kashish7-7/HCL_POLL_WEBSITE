const baseUrl = 'https://pollnow-beta.vercel.app';

async function runTest() {
  console.log('1. Checking /api/health...');
  const healthRes = await fetch(`${baseUrl}/api/health`);
  console.log('Health status:', healthRes.status, await healthRes.json());

  console.log('\n2. Registering user...');
  const email = `test_vercel_${Date.now()}@example.com`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', confirm_password: 'password123' })
  });
  const regData = await regRes.json();
  console.log('Register response:', regRes.status, regData);
  const token = regData.token;

  console.log('\n3. Creating poll...');
  const pollRes = await fetch(`${baseUrl}/api/polls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      question: 'Which framework is best for real-time apps?',
      options: ['React + Go', 'Next.js', 'Vue + Node']
    })
  });
  const pollData = await pollRes.json();
  console.log('Create poll response:', pollRes.status, pollData);
  const pollId = pollData.poll.id;
  const firstOptId = pollData.poll.options[0].id;

  console.log('\n4. Voting on poll...');
  const voteRes = await fetch(`${baseUrl}/api/polls/${pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option_id: firstOptId, voter_id: 'voter_prod_test_1' })
  });
  console.log('Vote response:', voteRes.status, await voteRes.json());

  console.log('\n5. Fetching poll results...');
  const resultsRes = await fetch(`${baseUrl}/api/polls/${pollId}/results`);
  console.log('Results response:', resultsRes.status, await resultsRes.json());
}

runTest().catch(console.error);
