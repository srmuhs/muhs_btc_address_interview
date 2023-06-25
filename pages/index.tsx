import Head from "next/head";
import Layout from "../components/layout";
import { GetStaticProps } from "next";
import LineChart from "../components/dataViz/LineChart";
import { BTCDataType } from "../types";

interface HomeProps {
  btcData: BTCDataType[];
}

export default function Home({ btcData }: HomeProps) {
  return (
    <Layout home>
      <Head>
        <title>BTC Address Balances over Time</title>
      </Head>
      <section>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <LineChart data={btcData} />
        </div>
      </section>
    </Layout>
  );
}

//SSR for possible SEO indexing as well as faster load times.
export const getStaticProps: GetStaticProps = async () => {
  const url =
    process.env.BTC_ADDRESSES_API_URL ||
    "http://localhost:3000/api/btc-addresses";

  try {
    const res = await fetch(url);
    const btcData = await res.json();

    return {
      props: { btcData }
      // you can add revalidate: number here for ISR (incremental static regeneration)
    };
  } catch (error) {
    console.error(`Error fetching BTC addresses`);

    return {
      notFound: true // this will return a 404 page
    };
  }
};
