import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authrouter from './routes/auth.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))
app.use(express.json())

app.use('/api/auth', authrouter)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

export default app