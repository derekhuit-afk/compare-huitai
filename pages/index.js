import Head from 'next/head'
import HomeComparison from '../components/HomeComparison'

export default function ComparePage() {
  return (
    <>
      <Head>
        <title>New Construction vs. Existing Home | Cardinal Financial · Derek Huit</title>
        <meta name="description" content="Compare the true costs of new construction vs. existing home purchase." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <HomeComparison />
    </>
  )
}
