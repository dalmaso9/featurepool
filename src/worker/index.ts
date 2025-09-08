import 'dotenv/config'
import { startWorkers } from '@/jobs/queues'

console.log('Starting workers...')
startWorkers()
