import Link from "next/link";
import { useRouter } from "next/router";
import { MongoClient } from "mongodb";
import { useState } from "react";

export default function Home(props) {
  const router = useRouter();
  const { data } = props;
  const [selectedStatus, setSelectedStatus] = useState("all");

  const navigatePage = () => router.push("/add-new");

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const filteredData = selectedStatus === "all" ? data : data.filter(invoice => invoice.status === selectedStatus);

  return (
    <div className="main__container">
      <div className="invoice__header">
        <div className="invoice__header-logo">
          <h3>Invoices</h3>
          <p>There are total {filteredData.length} invoices</p>
        </div>

        <div>
          <button className="btn" onClick={navigatePage}>
            Add New
          </button>
        </div>

       
      </div>
      <div className="Filter">
          <label htmlFor="statusFilter">Filter by Status: </label>
          <select id="statusFilter" value={selectedStatus} onChange={handleStatusChange}>
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      <div className="invoice__container">
        {/* ======= invoice item =========== */}
        {filteredData?.map((invoice) => (
          <Link href={`/invoices/${invoice.id}`} passHref key={invoice.id}>
            <div className="invoice__item">
              <div>
                <h5 className="invoice__id">
                  {invoice.id.substr(0, 6).toUpperCase()}
                </h5>
              </div>

              <div>
                <h3 className="invoice__client">{invoice.clientName}</h3>
              </div>

              <div>
                <p className="invoice__created">{invoice.createdAt}</p>
              </div>

              <div>
                <h3 className="invoice__total">Rs.{invoice.total}</h3>
              </div>

              <div>
                <button
                  className={`${
                    invoice.status === "paid"
                      ? "paid__status"
                      : invoice.status === "pending"
                      ? "pending__status"
                      : "draft__status"
                  }`}
                >
                  {invoice.status}
                </button>
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
  const collection = db.collection("allInvoices");

  const invoices = await collection.find({}).toArray();

  return {
    props: {
      data: invoices.map((invoice) => {
        return {
          id: invoice._id.toString(),
          clientName: invoice.clientName,
          createdAt: invoice.createdAt,
          total: invoice.total,
          status: invoice.status,
        };
      }),
    },
    revalidate: 1,
  };
}
