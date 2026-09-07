import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { MongoClient } from 'mongodb'

type Bindings = {
  MONGODB_URI: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({ origin: '*' }))

const getDb = async (uri: string) => {
  const client = new MongoClient(uri)
  await client.connect()
  return { client, db: client.db('uOLink') }
}

app.post('/auth/register', async (c) => {
  try {
    const body = await c.req.json()
    const { client, db } = await getDb(c.env.MONGODB_URI)
    
    const existingUser = await db.collection('users').findOne({ username: body.username })
    if (existingUser) {
      await client.close()
      return c.json({ message: "User already exists" }, 400)
    }

    const result = await db.collection('users').insertOne(body)
    await client.close()

    return c.json({ message: "User registered successfully", user: result }, 201)
  } catch (err) {
    return c.json({ message: "Server error", error: String(err) }, 500)
  }
})

app.post('/auth/login', async (c) => {
  try {
    const body = await c.req.json()
    const { client, db } = await getDb(c.env.MONGODB_URI)
    
    const user = await db.collection('users').findOne({ username: body.username })
    await client.close()

    if (!user) {
      return c.json({ message: "User not found" }, 404)
    }

    return c.json({ user })
  } catch (err) {
    return c.json({ message: "Server error", error: String(err) }, 500)
  }
})

app.get('/post', async (c) => {
  try {
    const { client, db } = await getDb(c.env.MONGODB_URI)
    const posts = await db.collection('posts').find({}).toArray()
    await client.close()

    return c.json(posts)
  } catch (err) {
    return c.json({ message: "Server error", error: String(err) }, 500)
  }
})

export default app