import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw).users || []
  } catch (e) {
    return []
  }
}

function writeUsers(users: any[]) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true })
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2), 'utf-8')
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password || !name) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    const users = readUsers()
    const exists = users.find((u: any) => u.email === email.toLowerCase())
    if (exists) {
      return Response.json({ error: 'User already exists' }, { status: 409 })
    }

    const passwordHash = bcrypt.hashSync(password, 10)
    const id = Date.now().toString()
    const user = { id, name, email: email.toLowerCase(), passwordHash }
    users.push(user)
    writeUsers(users)

    const token = jwt.sign({ userId: id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: '7d',
    })

    return Response.json({ user: { id, name, email: user.email }, token })
  } catch (error) {
    console.error('[v0] Register error:', error)
    return Response.json({ error: 'Registration failed' }, { status: 500 })
  }
}
