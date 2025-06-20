import { useState, useEffect } from "react";
import { message, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { UpdateNewsByID } from "../../../../services/index";
import BackgroundImage from "../../../../assets/admin/img/img.jpg";
import "../new.css";

const EditNews = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { newsId, initialTitle = "", initialDescription = "", initialPicture = "" } = location.state || {};

  const [fileList, setFileList] = useState<any[]>(
    initialPicture
      ? [
          {
            uid: "-1",
            name: "current.jpg",
            status: "done",
            url: `http://localhost:8000/${initialPicture}`,
          },
        ]
      : []
  );
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const employeeID = 1;

  useEffect(() => {
    if (!newsId) {
      message.warning("ไม่พบข้อมูลข่าวที่จะแก้ไข");
      navigate("/admin/edit-new");
    }
  }, [newsId, navigate]);

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

    if (!title || !description) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("employeeID", employeeID.toString());

    const hasNewImage = fileList.length > 0 && fileList[0].originFileObj;
    if (hasNewImage) {
      formData.append("picture", fileList[0].originFileObj);
    }

    const result = await UpdateNewsByID(newsId, formData);

    if (result) {
      message.success("อัปเดตข่าวสำเร็จ");
      navigate("/admin/edit-new");
    } else {
      message.error("อัปเดตข่าวล้มเหลว");
    }
  };

  return (
    <div>
      <main>
        <section className="new-contact">
          <div className="new-container">
            <div className="new-left">
              <div className="form-wrapper">
                <div className="contact-heading">
                  <h1>
                    Edit News<span>.</span>
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
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="new-right">
              <div className="image-wrapper">
                <img src={BackgroundImage} className="contact-img" alt="Contact" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditNews;
