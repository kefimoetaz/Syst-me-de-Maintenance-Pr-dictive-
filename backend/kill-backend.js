/**
 * Kill the backend process running on port 3000
 */
const { execSync } = require('child_process');

try {
  console.log('Finding process on port 3000...\n');
  
  // Find the process
  const output = execSync('netstat -ano | findstr :3000', { encoding: 'utf-8' });
  
  if (!output) {
    console.log('No process found on port 3000');
    process.exit(0);
  }
  
  console.log('Processes found:');
  console.log(output);
  
  // Extract PIDs
  const lines = output.split('\n').filter(line => line.includes('LISTENING'));
  const pids = new Set();
  
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && !isNaN(pid)) {
      pids.add(pid);
    }
  });
  
  if (pids.size === 0) {
    console.log('\nNo LISTENING process found on port 3000');
    process.exit(0);
  }
  
  console.log(`\nFound ${pids.size} process(es) to kill: ${Array.from(pids).join(', ')}`);
  console.log('\nKilling processes...');
  
  pids.forEach(pid => {
    try {
      execSync(`taskkill /PID ${pid} /F`, { encoding: 'utf-8' });
      console.log(`✓ Killed process ${pid}`);
    } catch (error) {
      console.log(`✗ Failed to kill process ${pid}: ${error.message}`);
    }
  });
  
  console.log('\n✓ Done! You can now run: npm start');
  
} catch (error) {
  if (error.message.includes('No process found')) {
    console.log('No process found on port 3000');
  } else {
    console.error('Error:', error.message);
  }
}
