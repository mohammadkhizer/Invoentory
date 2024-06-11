import Link from "next/link";
import { useRouter } from "next/router";
import { MongoClient } from "mongodb";

export default function Home(props) {
  const router = useRouter();
  const { data } = props;

  const navigatePage = () => router.push("/");
  const navigateAddinvoice = () => router.push("/add-new");
  const navigateProductPage = () => router.push("/productsdashoboard")
  return (
    <div className="main__container">
      <div className="invoice__header">
        <div className="invoice__header-logo">
          <h3>Invoices</h3>
          <p>There are total {data.length} invoices</p>
        </div>

        <div>
            <button className="btn" onClick={navigatePage}>
                Go To Dashobard
            </button>
            <button className="btn" onClick={navigateAddinvoice}>
                Add New Invoice
            </button>
            <button className="btn" onClick={navigateProductPage}>
                Go To Products
            </button>
        </div>
      </div>

      <div className="invoice__container">
        {/* ======= invoice item =========== */}
        {data?.map((invoice) => (
          <Link href={`/product/${invoice.id}`} passRef key={invoice.id}>
            <div className="invoice__item">
              <div>
                <h5 className="invoice__id">
                  {invoice.id.substr(0, 6).toUpperCase()}
                </h5>
              </div>

              <div>
                <h6 className="invoice__client">{invoice.productName}</h6>
              </div>

              <div>
                <p className="invoice__created">{invoice.productQuantity}</p>
              </div>

              <div>
                <h3 className="invoice__total">Rs.{invoice.productPrice}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


export async function getStaticProps() {
  const client = await MongoClient.connect(
    `${process.env.MONGO_URI}`,
    { useNewUrlParser: true }
  );

  const db = client.db();
  const collection = db.collection("allproducts");

  const invoices = await collection.find({}).toArray();

  return {
    props: {
      data: invoices.map((invoice) => {
        return {
          id: invoice._id.toString(),
          productName: invoice.productName,
          productQuantity: invoice.productQuantity,
          productPrice: invoice.productPrice,
        };
      }),
    },
    revalidate: 1,
  };
}
