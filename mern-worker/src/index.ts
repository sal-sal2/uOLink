import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  ATLAS_API_KEY: string
  ATLAS_DATA_API_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({ origin: '*' }))

app.get('/api/posts', async (c) => {
  const response = await fetch(`${c.env.ATLAS_DATA_API_URL}/action/find`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': c.env.ATLAS_API_KEY,
    },
    body: JSON.stringify({
      dataSource: 'Cluster0',
      database: 'uOLink',
      collection: 'users',
      filter: {}
    }),
  })

  const data = await response.json()
  return c.json(data)
})

export default app