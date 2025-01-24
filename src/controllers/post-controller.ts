import { prisma } from '../prisma-client'
import { Request, Response } from 'express'
import path from 'path'

const PostController = {
	createPost: async (req: any, res: any) => {
		const { content } = req.body
		const userId = req.user.userId

		if (!content) {
			return res.status(400).json({ error: 'Content is required' })
		}

		try {
			let mediaUrl: string | null = null

			if (req.file) {
				const mediaPath = path.join(process.cwd(), 'uploads', req.file.filename)
				mediaUrl = `/uploads/${req.file.filename}`
			}

			const post = await prisma.post.create({
				data: {
					content,
					mediaUrl,
					authorId: userId,
				},
			})

			res.json(post)
		} catch (error) {
			console.error('Error creating post:', error)
			res.status(500).json({ error: 'Something went wrong' })
		}
	},

	updatePost: async (req: any, res: any) => {
		const { id } = req.params
		const { content } = req.body
		const userId = req.user.userId

		try {
			const post = await prisma.post.findUnique({ where: { id } })

			if (!post) {
				return res.status(404).json({ error: 'Post not found' })
			}

			if (post.authorId !== userId) {
				return res
					.status(403)
					.json({ error: 'You can only edit your own posts' })
			}

			let mediaUrl = post.mediaUrl

			if (req.file) {
				const mediaPath = path.join(process.cwd(), 'uploads', req.file.filename)
				mediaUrl = `/uploads/${req.file.filename}`
			}

			const updatedPost = await prisma.post.update({
				where: { id },
				data: { content, mediaUrl },
			})

			res.json(updatedPost)
		} catch (error) {
			console.error('Error updating post:', error)
			res.status(500).json({ error: 'Something went wrong' })
		}
	},

	deletePost: async (req: any, res: any) => {
		const { id } = req.params
		const userId = req.user.userId

		try {
			const post = await prisma.post.findUnique({ where: { id } })

			if (!post) {
				return res.status(404).json({ error: 'Post not found' })
			}

			if (post.authorId !== userId) {
				return res
					.status(403)
					.json({ error: 'You can only delete your own posts' })
			}

			await prisma.post.delete({ where: { id } })

			res.json({ message: 'Post deleted successfully' })
		} catch (error) {
			console.error('Error deleting post:', error)
			res.status(500).json({ error: 'Something went wrong' })
		}
	},

	getAllPosts: async (req: Request, res: any) => {
		try {
			const posts = await prisma.post.findMany({
				include: {
					author: {
						select: {
							name: true,
							imageUrl: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
			})

			res.json(posts)
		} catch (error) {
			console.error('Error fetching posts:', error)
			res.status(500).json({ error: 'Something went wrong' })
		}
	},

	getPostById: async (req: any, res: any) => {
		const { id } = req.params

		try {
			const post = await prisma.post.findUnique({
				where: { id },
				include: {
					author: {
						select: {
							name: true,
							imageUrl: true,
						},
					},
				},
			})

			if (!post) {
				return res.status(404).json({ error: 'Post not found' })
			}

			res.json(post)
		} catch (error) {
			console.error('Error fetching post:', error)
			res.status(500).json({ error: 'Something went wrong' })
		}
	},
}

export default PostController
