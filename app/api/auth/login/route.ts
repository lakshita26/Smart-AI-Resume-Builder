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

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    const users = readUsers()
    const user = users.find((u: any) => u.email === email.toLowerCase())
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const ok = bcrypt.compareSync(password, user.passwordHash)
    if (!ok) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: '7d',
    })

    return Response.json({ user: { id: user.id, name: user.name, email: user.email }, token })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}
