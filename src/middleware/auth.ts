const jwt = require('jsonwebtoken')
import { User } from '@prisma/client'

const authenticateToken = (req: any, res: any, next: any) => {
	const authHeader = req.headers['authorization']

	const token = authHeader && authHeader.split(' ')[1]

	if (!token) return res.sendStatus(401).json({ error: 'Unauthorized' })

	jwt.verify(token, `${process.env.SECRET_KEY}`, (err: any, user: User) => {
		if (err) {
			return res.status(403).json({ error: 'Invalid token' })
		}

		req.user = user

		next()
	})
}

export default authenticateToken
