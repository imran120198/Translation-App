import axios from "axios";
import { useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import { AiFillCopy } from "react-icons/ai";
import { MdClear } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SelectBox } from "./SelectBox";

export const Translator = () => {
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [output, setOutput] = useState("");

  const handleSelectChange = ({ target: { value, id } }) => {
    if (id === "source") setSource(value);
    if (id === "target") setTarget(value);
  };

  const handleGetRequest = async () => {
    if (q.length < 1) {
      setOutput("");
      return false;
    }
    if (source === "" || target === "") {
      return alert("Please select language");
    }

    const options = {
      method: "POST",
      url: "https://google-translator9.p.rapidapi.com/v2",
      headers: {
        "x-rapidapi-key": "31b5868d0emshc88f984b3b51736p1fbccejsn667a6057b60b",
        "x-rapidapi-host": "google-translator9.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        q,
        source,
        target,
        format: "text",
      },
    };

    try {
      const response = await axios.request(options);
      const translatedText = response.data.data.translations[0].translatedText;
      console.log("translatedText:", translatedText);
      setOutput(translatedText);
    } catch (err) {
      console.log(err);
    }
  };

  const copyToClipboard = (text) => {
    copy(text);
    alert("Copied to clipboard!");
  };

  const resetText = () => {
    if (q === "" && output === "") {
      alert("Textbox is already empty!");
    } else {
      alert("Text removed!");
      setQ("");
      setOutput("");
    }
  };

  // Debounce Function
  useEffect(() => {
    let timerID = setTimeout(() => {
      handleGetRequest();
    }, 1000);

    return () => {
      clearTimeout(timerID);
    };
  }, [q]);

  return (
    <>
      <div className="mainBox">
        <div>
          <SelectBox id={"source"} select={handleSelectChange} />
          <div className="box">
            <textarea
              onChange={(e) => setQ(e.target.value)}
              value={q}
              className="outputResult"
              placeholder="Enter text to translate"
            ></textarea>
          </div>
          <div className="iconBox">
            <p>{q.length}/500</p>
            <AiFillCopy onClick={() => copyToClipboard(q)} className="icon" />
            <MdClear onClick={resetText} className="icon" />
          </div>
        </div>

        <div>
          <SelectBox id={"target"} select={handleSelectChange} />
          <div className="outputResult box">
            <p id="output">{output}</p>
          </div>
          <div className="iconBox">
            <p>{output.length}/500</p>
            <AiFillCopy
              onClick={() => copyToClipboard(output)}
              className="icon"
            />
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};
