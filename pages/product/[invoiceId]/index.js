import React, { useRef } from "react";
import { useRouter } from "next/router";
import { MongoClient, ObjectId } from "mongodb";
import { toast } from "react-toastify";

const ProductDetails = (props) => {
  const router = useRouter();
  const { data } = props;
  const modalRef = useRef(null);
  const goBack = () => router.push("/");

  // delete invoice from the database
  const deleteInvoice = async (invoiceId) => {
    try {
      const res = await fetch(`/api/product/${invoiceId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      toast.success(data.message);
      router.push("/");
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  // open modal
  const modalToggle = () => modalRef.current.classList.toggle("showModal");

  return (
    <div className="main__container">
      <div className="back__btn">
        <h6 onClick={goBack}> Go Back</h6>
      </div>

      {/* ======= invoice details header ========== */}
      <div className="invoice__details-header">
        <div className="details__btns">
          <button
            className="edit__btn"
            onClick={() => router.push(`/editProduct/${data.id}`)}
          >
            Edit
          </button>

          {/* ========= confirm deletion modal start ========== */}
          <div className="delete__modal" ref={modalRef}>
            <div className="modal">
              <h3>Confirm Deletion</h3>
              <p>
                Are you sure you want to delete invoice #
                {data.id.substr(0, 6).toUpperCase()}? This action cannot be
                undone.
              </p>

              <div className="details__btns modal__btns">
                <button className="edit__btn" onClick={modalToggle}>
                  Cancel
                </button>

                <button
                  className="delete__btn"
                  onClick={() => deleteInvoice(data.id)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>

          {/* ======== confirm deletion modal end */}

          <button className="delete__btn" onClick={modalToggle}>
            Delete
          </button>
        </div>
        {/* ========= invoice items ============= */}
        <div className="invoice__item-box">
          <ul className="list">
            <li className="list__item">
              <p className="item__name-box">Item Name</p>
              <p className="list__item-box">Qty</p>
              <p className="list__item-box">Price</p>
            </li>

            {/* ======== invoice item ======= */}

            {data.items?.map((item, index) => (
              <li className="list__item" key={index}>
                <div className="item__name-box">
                  <h5>{item.productName}</h5>
                </div>

                <div className="list__item-box">
                  <p>{item.productQuantity}</p>
                </div>
                <div className="list__item-box">
                  <p>Rs.{item.productPrice}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ========== grand total ============= */}
      </div>
    </div>
  );
};

export default ProductDetails;

export async function getStaticPaths() {
  let client;

  try {
    client = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    const db = client.db();
    const collection = db.collection("allproducts");
    const invoices = await collection.find({}, { _id: 1 }).toArray();

    const paths = invoices.map((invoice) => ({
      params: { invoiceId: invoice._id.toString() },
    }));

    return {
      fallback: "blocking",
      paths,
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return {
      fallback: "blocking",
      paths: [],
    };
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
}

export async function getStaticProps(context) {
  const { params } = context;
  const { invoiceId } = params; // Correctly access invoiceId from params
  let client;

  try {
    client = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    const db = client.db();
    const collection = db.collection("allproducts");
    const invoice = await collection.findOne({ _id: ObjectId(invoiceId) });

    console.log("Retrieved invoice:", invoice);

    if (!invoice) {
      console.log("Invoice not found:", invoiceId);
      return {
        notFound: true,
      };
    }

    return {
      props: {
        data: {
          id: invoice._id.toString(),
          productName: invoice.productName || "",
          productQuantity: invoice.productQuantity || 0,
          productPrice: invoice.productPrice || 0,
          items: invoice.items ?? [],
        },
      },
      revalidate: 1,
    };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return {
      notFound: true,
    };
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
}
