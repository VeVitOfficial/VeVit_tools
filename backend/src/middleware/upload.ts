import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const jobId = uuidv4()
    const dest = path.join('/tmp/vevit-uploads', jobId)
    cb(null, dest)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  },
})
