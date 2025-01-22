import { Router } from 'express'
const router = Router()
import multer, { diskStorage } from 'multer'
import UserController from '../controllers/user-controller'
import authenticateToken from '../middleware/auth'

const uploadDestination = 'uploads'

const storage = diskStorage({
	destination: uploadDestination,
	filename: (req, file, cb) => {
		cb(null, file.originalname)
	},
})

const uploads = multer({
	storage: storage,
})

// user routes
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/current', authenticateToken, UserController.current)
router.get('/users/:id', authenticateToken, UserController.getUserById)

export default router
