import { useEffect, useState } from "react";
import { message, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { CreateNews } from "../../../../services/index"; // ปรับ path ให้ตรงกับไฟล์ service คุณ
import BackgroundImage from "../../../../assets/admin/img/img.jpg";
import "../new.css";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const [employeeid, setEmployeeid] = useState<number>(
    Number(localStorage.getItem("employeeid")) || 0
  );
  const employeeID = employeeid;

  const onChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src && file.originFileObj) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const imgWindow = window.open(src);
    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;" />`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fileList.length === 0) {
      message.error("กรุณาอัปโหลดรูปภาพ");
      return;
    }

    if (!title || !description) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("picture", fileList[0].originFileObj);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("employeeID", employeeID.toString());
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const result = await CreateNews(formData);

    if (result) {
      message.success("สร้างข่าวสำเร็จ");
      setTimeout(() => {
        setFileList([]);
        setTitle("");
        setDescription("");
        navigate("/admin/New");
      }, 2000);
    } else {
      message.error("สร้างข่าวล้มเหลว");
    }
  };

  useEffect(() => {
    setEmployeeid(Number(localStorage.getItem("employeeid")));
  }, []);

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

                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="input-wrap w-full flex justify-center md:justify-start">
                    <ImgCrop rotationSlider>
                      <Upload
                        fileList={fileList}
                        onChange={onChange}
                        onPreview={onPreview}
                        beforeUpload={(file) => {
                          const isImage = file.type.startsWith("image/");
                          if (!isImage) {
                            message.error("กรุณาอัปโหลดไฟล์รูปภาพ");
                            return Upload.LIST_IGNORE;
                          }
                          return false;
                        }}
                        maxCount={1}
                        multiple={false}
                        listType="picture-card"
                      >
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      </Upload>
                    </ImgCrop>
                  </div>

                  <div className="input-wrap">
                    <input
                      className="contact-input"
                      autoComplete="off"
                      name="Title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="Title"
                    />
                    <i className="contact-icon fa-solid fa-heading"></i>
                  </div>

                  <div className="input-wrap input-wrap-textarea input-wrap-full">
                    <textarea
                      name="Description"
                      autoComplete="off"
                      className="contact-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      placeholder="Description"
                    ></textarea>
                    <i className="contact-icon fa-solid fa-file-lines"></i>
                  </div>

                  <div className="contact-buttons">
                    <button className="contact-btn" type="submit">
                      Submit
                    </button>
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

export default Index;
