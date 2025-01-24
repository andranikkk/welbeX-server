import { Router } from 'express'
const router = Router()
import UserController from '../controllers/user-controller'
import authenticateToken from '../middleware/auth'
import PostController from '../controllers/post-controller'
import multer from 'multer'

const uploads = multer({
	storage: multer.diskStorage({
		destination: 'uploads',
		filename: (req, file, cb) => {
			cb(null, file.originalname)
		},
	}),
})

// user routes
router.post('/login', UserController.login)
router.post('/register', UserController.register)
router.get('/current', authenticateToken, UserController.current)
router.get('/users/:id', authenticateToken, UserController.getUserById)

// posts routes
router.get('/posts', PostController.getAllPosts)
router.get('/posts/:id', PostController.getPostById)
router.post(
	'/posts',
	authenticateToken,
	uploads.single('mediaUrl'),
	PostController.createPost
)
router.put('/posts/:id', authenticateToken, PostController.updatePost)
router.delete('/posts/:id', authenticateToken, PostController.deletePost)

export default router
