import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const AddNew = () => {
  const router = useRouter();
  const [items, setItems] = useState([]);

  const productName = useRef("");
  const productQuantity = useRef("");
  const productPrice = useRef("");

   // submit data to the database
  const createInvoice = async (status) => {
    try {
      if (
        productName.current.value === "" ||
        productQuantity.current.value === "" ||
        productPrice.current.value === ""
      ) {
        toast.warning("All fields are required. Must provide valid data");
      } else {
        const res = await fetch("/api/add-product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: productName.current.value,
            productQuantity: productQuantity.current.value,
            productPrice: productPrice.current.value,
          }),
        });
        const data = await res.json();

        toast.success(data.message);
        router.push("/");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="main__container">
      <div className="new__invoice">
        <div className="new__invoice-header">
          <h3>New Product</h3>
        </div>

        {/* ======== new invoice body ========= */}
        <div className="new__invoice-body">
          {/* ======= bill from ========== */}
          <div className="bill__from">
            <p className="bill__title">Product from</p>
            <div className="form__group">
              <p>Product Name</p>
              <input type="text" ref={productName} />
            </div>

            <div className="form__group inline__form-group">
              <div>
                <p>Product Quantity</p>
                <input type="text" ref={productQuantity} />
              </div>

              <div>
                <p>Product Price</p>
                <input type="text" ref={productPrice} />
              </div>
            </div>
        </div>
          <div className="new__invoice__btns">
            <button className="edit__btn" onClick={() => router.push("/")}>
              Discard
            </button>
            <div>
              <button
                className="draft__btn"
                onClick={() => createInvoice("draft")}
              >
                Save as Draft
              </button>

              <button
                className="mark__as-btn"
                onClick={() => createInvoice("pending")}
              >
                Send & Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNew;
