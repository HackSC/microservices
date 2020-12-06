import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SWRConfig } from 'swr'

function MyApp({ Component, pageProps }: AppProps) {
  return <SWRConfig value={{ refreshInterval: process.env.VERCEL_URL ? 10000 : 60000 }}><Component {...pageProps} /></SWRConfig>
}

export default MyApp