import "../new.css";
import BackgroundImage from "../../../assets/admin/img/img.jpg";

const index = () => {
  return (
    <div>
      <main>
        <section className="new-contact">
          <div className="new-container">
            <div className="new-left">
              <div className="form-wrapper">
                <div className="contact-heading">
                  <h1>
                    New Management<span>.</span>
                  </h1>
                  <p className="contact-text">
                    writing by: <a>admin@gmail.com</a>
                  </p>
                </div>

                <form action="index.html" method="post" className="contact-form">
                  <div className="input-wrap">
                    <input
                      className="contact-input"
                      autoComplete="off"
                      name="First Name"
                      type="text"
                      required
                    />
                    <label>First name</label>
                    <i className="contact-icon fa-solid fa-address-card"></i>
                  </div>

                  <div className="input-wrap">
                    <input
                      className="contact-input"
                      autoComplete="off"
                      name="Last Name"
                      type="text"
                      required
                    />
                    <label>Last name</label>
                    <i className="contact-icon fa-solid fa-address-card"></i>
                  </div>

                  <div className="input-wrap input-wrap-full">
                    <input
                      className="contact-input"
                      autoComplete="off"
                      name="Email"
                      type="email"
                      required
                    />
                    <label>Email</label>
                    <i className="contact-icon fa-solid fa-envelope"></i>
                  </div>

                  <div className="input-wrap input-wrap-textarea input-wrap-full">
                    <textarea
                      name="Message"
                      autoComplete="off"
                      className="contact-input"
                      required
                    ></textarea>
                    <label>Message</label>
                    <i className="contact-icon fa-solid fa-inbox"></i>
                  </div>

                  <div className="contact-buttons">
                    <button className="contact-btn upload" type="button">
                      <span>
                        <i className="fa-solid fa-paperclip"></i> Clear
                      </span>
                      <input type="file" name="attachment" />
                    </button>
                    <input type="submit" value="Send message" className="contact-btn" />
                  </div>
                </form>
              </div>
            </div>

            <div className="new-right">
              <div className="image-wrapper">
                <img src={BackgroundImage} className="contact-img" alt="Contact" />
                <div className="wave-wrap">
                  <svg
                    className="wave"
                    viewBox="0 0 783 1536"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      id="wave"
                      d="M236.705 1356.18C200.542 1483.72 64.5004 1528.54 1 1535V1H770.538C793.858 63.1213 797.23 196.197 624.165 231.531C407.833 275.698 274.374 331.715 450.884 568.709C627.393 805.704 510.079 815.399 347.561 939.282C185.043 1063.17 281.908 1196.74 236.705 1356.18Z"
                    />
                  </svg>
                </div>
                <svg
                  className="dashed-wave"
                  viewBox="0 0 345 877"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    id="dashed-wave"
                    d="M0.5 876C25.6667 836.167 73.2 739.8 62 673C48 589.5 35.5 499.5 125.5 462C215.5 424.5 150 365 87 333.5C24 302 44 237.5 125.5 213.5C207 189.5 307 138.5 246 87C185 35.5 297 1 344.5 1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default index;
