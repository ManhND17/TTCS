import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Loader2 } from "lucide-react";

const Translator = () => {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState("");

  const recognitionRef = useRef(null);

  // Khởi tạo SpeechRecognition API
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true; // Cho phép nhận diện trong thời gian thực

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (event) => {
      setError("Lỗi nhận diện giọng nói: " + event.error);
    };

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
  };

  // Bắt đầu hoặc dừng việc ghi âm
  const toggleListening = () => {
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Gửi nội dung đến API dịch
  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input,
          targetLang: "vi",
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setOutput(data.translation);
    } catch (err) {
      setError("Lỗi dịch thuật: " + err.message);
      console.error("Translation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý phím Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    initSpeechRecognition();
  }, []);

  return (
    <div
      style={{
        background: "#333",
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingBottom: "50px",
        alignItems: "center",
        color: "white",
      }}
    >
      <h1 style={{ marginBottom: "20px", fontSize: "24px" }}>
        Tôi có thể giúp gì được cho bạn?
      </h1>

      {error && (
        <div style={{ color: "#ff4444", marginBottom: "10px" }}>{error}</div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "80%",
          maxWidth: "1000px",
          background: "#444",
          padding: "15px",
          borderRadius: "10px",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          value={input}
          placeholder="Hỏi bất kỳ điều gì..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          style={{
            flex: 1,
            color: "#ffff",
            background: "#444",
            border: "none",
            height: "50px",
            padding: "10px",
            borderRadius: "10px",
            outline: "none",
            fontSize: 18,
            opacity: isLoading ? 0.7 : 1,
          }}
        />

        <button
          onClick={toggleListening}
          disabled={isLoading}
          style={{
            cursor: "pointer",
            background: listening ? "#ff4444" : "#555",
            border: "none",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isLoading && listening ? (
            <Loader2 className="animate-spin" size={24} color="#fff" />
          ) : (
            <Mic size={24} color="#fff" />
          )}
        </button>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          style={{
            cursor: "pointer",
            padding: "10px 20px",
            border: "none",
            background: isLoading ? "#777" : "#ff9800",
            color: "white",
            borderRadius: "5px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Đang xử lý...
            </>
          ) : (
            <>
              <Send size={18} />
              Gửi
            </>
          )}
        </button>
        {output && (
          <div
            style={{ marginTop: "20px", fontSize: "18px", color: "#90ee90" }}
          >
            <strong>Kết quả:</strong> {output}
          </div>
        )}
      </div>
    </div>
  );
};

export default Translator;
