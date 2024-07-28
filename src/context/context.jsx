import { createContext, useState, useEffect } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");
  const [timeouts, setTimeouts] = useState([]);

  const delayPara = (index, nextWord) => {
    const timeout = setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
    setTimeouts((prev) => [...prev, timeout]);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setResultData("");
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);

    let response;
    if (prompt !== undefined) {
      response = await run(prompt);
      setRecentPrompt(prompt);
    } else {
      setPrevPrompts((prev) => [...prev, input]);
      setRecentPrompt(input);
      response = await run(input);
    }

    const responseArray = response.split("**");
    let newResponse = responseArray
      .map((part, index) =>
        index === 0 || index % 2 !== 1 ? part : `<b>${part}</b>`
      )
      .join("");
    const newResponse2 = newResponse.split("*").join("</br>");
    const newResponseArray = newResponse2.split(" ");

    newResponseArray.forEach((nextWord, i) => {
      delayPara(i, nextWord + " ");
    });

    setLoading(false);
    setInput("");
  };

  useEffect(() => {
    return () => {
      // Clear all timeouts on component unmount
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [timeouts]);

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
