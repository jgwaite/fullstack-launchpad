#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Socket } from 'node:net'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new Socket()
    const cleanup = (result) => {
      socket.destroy()
      resolve(result)
    }

    socket.setTimeout(750)
    socket.once('connect', () => cleanup(true))
    socket.once('timeout', () => cleanup(false))
    socket.once('error', () => cleanup(false))

    socket.connect(port, '127.0.0.1')
  })
}

async function resolveBaseURL() {
  if (process.env.PW_BASE_URL) {
    return process.env.PW_BASE_URL
  }

  const candidatePorts = []
  const testPort = Number(process.env.FRONTEND_TEST_PORT)
  const devPort = Number(process.env.FRONTEND_PORT)

  if (!Number.isNaN(testPort)) candidatePorts.push(testPort)
  candidatePorts.push(5180)
  if (!Number.isNaN(devPort)) candidatePorts.push(devPort)
  candidatePorts.push(5173)

  for (const port of candidatePorts) {
    if (await isPortOpen(port)) {
      return `http://localhost:${port}`
    }
  }

  return 'http://localhost:5180'
}

const baseURL = await resolveBaseURL()

const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['playwright', 'test', ...args], {
  stdio: 'inherit',
  cwd: resolve(__dirname, '..'),
  env: {
    ...process.env,
    PW_WEB_SERVER: '0',
    PW_BASE_URL: baseURL,
  },
})

process.exit(result.status ?? 0)
