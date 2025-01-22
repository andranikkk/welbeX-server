import { prisma } from '../prisma-client'
import bcrypt from 'bcryptjs'
import Jdenticon from 'jdenticon'
import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'

const UserController = {
	register: async (req: any, res: any) => {
		const { email, password, name } = req.body

		if (!email || !password || !name) {
			return res.status(400).json({ error: 'All fields are required' })
		}

		try {
			const existingUser = await prisma.user.findUnique({
				where: { email },
			})

			if (existingUser) {
				return res.status(400).json({ error: 'User already exists' })
			}

			const hashedPassword = await bcrypt.hash(password, 10)

			const png = Jdenticon.toPng(`${name}${Date.now()}`, 200)
			const avatarName = `${name}_${Date.now()}.png`
			const avatarPath = path.join(process.cwd(), 'uploads', avatarName)
			fs.writeFileSync(avatarPath, png)

			const user = await prisma.user.create({
				data: {
					email,
					password: hashedPassword,
					name,
					imageUrl: `/uploads/${avatarName}`,
				},
			})

			res.json(user)
		} catch (error) {
			console.error('Error while registering', error)
			res.status(500).json({ error: 'Something went wrong register' })
		}
	},

	login: async (req: any, res: any) => {
		const { email, password } = req.body

		if (!email || !password) {
			return res.status(400).json({ error: 'Invalid email or password' })
		}

		try {
			const user = await prisma.user.findUnique({
				where: { email },
			})

			if (!user) {
				return res.status(400).json({ error: 'Invalid email or password' })
			}

			const isPasswordValid = await bcrypt.compare(password, user.password)
			if (!isPasswordValid) {
				return res.status(400).json({ message: 'Invalid email or password' })
			}

			const token = jwt.sign({ userId: user.id }, `${process.env.SECRET_KEY}`)

			res.json({ token })
		} catch (error) {
			console.error('Error while logging in', error)
			res.status(500).json({ error: 'Something went wrong' })
		}
	},

	current: async (req: any, res: any) => {
		try {
			const user = await prisma.user.findUnique({
				where: {
					id: req.user.userId,
				},
			})

			if (!user) {
				return res
					.status(400)
					.json({ error: 'Error while getting current user' })
			}

			res.json(user)
		} catch (error) {
			console.error('Error while getting current user (catched)', error)
			res.status(500).json({ error: 'Something went wrong' })
		}
	},

	getUserById: async (req: any, res: any) => {
		const { id } = req.params

		try {
			const user = await prisma.user.findUnique({
				where: { id },
			})

			if (!user) {
				return res.status(404).json({ error: 'User not found' })
			}

			res.json({ ...user })
		} catch (error) {
			console.error('Error while getting user', error)
			res.status(500).json({ error: 'Something went wrong' })
		}
	},
}

export default UserController
