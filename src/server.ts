import app from './index'
import http from 'http'

const PORT = process.env.PORT || 3010

const server = http.createServer(app)

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})

server.on('error', error => {
	console.error('Server error:', error)
})
