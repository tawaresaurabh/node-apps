run `docker-compose up`

Server 1 runs on port 5001
Server 2 runs on port 5002

Test the message broker by sending a request to http://localhost:5001/test?data=<your-message> on your browser and checking the logs of server 1 & 2

Example:

*Making the request*

http://localhost:5001/test?data=Hello

*Will print:*

**SERVER 1:**
Server 1 sent {data: 'Hello'} to server 2

**SERVER 2:**
Server 2 Received:  { data: 'Hello' }

**SERVER 1:**
Server 1 Received:  {
  data: 'Hello',
  stage: { stage: 'In progress', time: 1000, progress: 10 }
}
Server 1 Received:  {
  data: 'Hello',
  stage: { stage: 'In progress', time: 2000, progress: 30 }
}
Server 1 Received:  {
  data: 'Hello',
  stage: { stage: 'In progress', time: 3000, progress: 70 }
}
Server 1 Received:  {
  data: 'Hello',
  stage: { stage: 'In progress', time: 4000, progress: 90 }
}
Server 1 Received:  { data: 'Hello', stage: { stage: 'Ready', time: 5000, progress: 100 } }