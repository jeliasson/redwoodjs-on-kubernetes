import os from 'os'

export const handler = async (event, context) => {
  const date = new Date()
  const statusCode = 200

  return {
    statusCode,
    headers: { 'Content-Type': 'application/json ' },
    body: JSON.stringify({
      code: statusCode,
      message: 'OK',
      runtime: {
        os: {
          hostname: os.hostname(),
          uptime: Math.round(os.uptime(), 0),
        },
        process: {
          env: {
            NODE_ENV: process.env.NODE_ENV || null,
            RUNTIME_ENV: process.env.RUNTIME_ENV || null,
          },
          uptime: Math.round(process.uptime(), 0),
        },
      },
      date: {
        now: Math.round(Date.now() / 1000, 0),
        iso: date.toISOString(),
      },
    }),
  }
}
