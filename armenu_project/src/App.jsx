import { useEffect, useState } from "react";
import "@google/model-viewer/dist/model-viewer.min.js";
import QRCode from "qrcode";

function App() {
  const [menu, setMenu] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [qrCodeURL, setQrCodeURL] = useState("");

  // Mobile se website open karne ka URL
  const websiteURL = "http://192.168.18.238:5173";

  // Backend se menu data lana
  useEffect(() => {
    fetch("/get")
      .then((response) => response.json())
      .then((data) => {
        setMenu(data.fullmenu || []);
      })
      .catch((error) => {
        console.log("Menu error:", error);
      });
  }, []);

  // QR Code generate karna
  useEffect(() => {
    QRCode.toDataURL(websiteURL)
      .then((url) => {
        setQrCodeURL(url);
      })
      .catch((error) => {
        console.log("QR Error:", error);
      });
  }, [websiteURL]);

  // Selected 3D model set karna
  const viewAR = (modelPath) => {
    const fileName = modelPath.split("/").pop();

    const modelURL = `/ARModels/${fileName}`;

    setSelectedModel(modelURL);
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        color: "white",
      }}
    >
      <h1>🍽️ AR MENU</h1>

      {/* QR CODE */}
      {qrCodeURL && (
        <div
          style={{
            background: "white",
            padding: "20px",
            display: "inline-block",
            borderRadius: "10px",
            marginBottom: "30px",
          }}
        >
          <h3 style={{ color: "black" }}>
            Scan QR Code to Open AR Menu
          </h3>

          <img
            src={qrCodeURL}
            alt="AR Menu QR Code"
            width="200"
          />
        </div>
      )}

      <hr />

      {/* MENU ITEMS */}
      {menu.map((item) => (
        <div
          key={item._id}
          style={{
            border: "1px solid white",
            borderRadius: "10px",
            padding: "20px",
            margin: "20px 0",
            maxWidth: "300px",
          }}
        >
          <h2>{item.name}</h2>

          <p>Price: Rs. {item.price}</p>

          <button
            onClick={() => viewAR(item.URLmodel)}
            style={{
              padding: "10px 20px",
              marginTop: "10px",
              cursor: "pointer",
            }}
          >
            View AR
          </button>
        </div>
      ))}

      {/* 3D MODEL + AR */}
      {selectedModel && (
        <div
          style={{
            marginTop: "30px",
            border: "1px solid white",
            borderRadius: "10px",
            padding: "20px",
            maxWidth: "600px",
          }}
        >
          <button
            onClick={() => setSelectedModel(null)}
            style={{
              marginBottom: "20px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Close
          </button>

          <model-viewer
            src={selectedModel}
            camera-controls
            auto-rotate
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-placement="floor"
            ar-scale="auto"
            shadow-intensity="1"
            style={{
              width: "100%",
              height: "500px",
              backgroundColor: "#eeeeee",
            }}
          >
            <button
              slot="ar-button"
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              View in your space 📱
            </button>
          </model-viewer>
        </div>
      )}
    </div>
  );
}

export default App;