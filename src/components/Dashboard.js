import React, { useState, useRef, useEffect } from "react";
import "./Dashboard.scss";
import axios from "axios";
import Modal from "./Modal";

const initialUserData = {
  name: "",
  age: "",
  purposeOfVisit: "",
  numberOfPeople: "",
  withFamily: "",
  gender: "",
  maritalStatus: "",
  foodPreference: "",
  additionalNotes: "",
  locationPreference: "",
  budget: "1000",
  typeOfStay: "",
  stayPreference: "",
  requiredFacilities: "",
};

const questions = [
  { key: "name", question: "What's your name?" },
  { key: "age", question: "How old are you?", inputType: "number" },
  { key: "purposeOfVisit", question: "What's the purpose of your visit?" },
  { key: "numberOfPeople", question: "How many people are you traveling with?", inputType: "number" },
  { key: "withFamily", question: "Are you traveling with family?", inputType: "options", options: ["Yes", "No"] },
  { key: "gender", question: "Gender:", inputType: "options", options: ["Male", "Female", "Other"] },
  {
    key: "maritalStatus",
    question: "Marital status:",
    inputType: "options",
    options: ["Married", "Unmarried", "In a Couple"],
  },
  {
    key: "foodPreference",
    question: "Do you prefer veg, non-veg, or mix?",
    inputType: "options",
    options: ["Veg", "Non-Veg", "Mix"],
  },
  { key: "additionalNotes", question: "Any additional preferences? (e.g., smoking or alcohol allowed)" },
  {
    key: "locationPreference",
    question: "Which area or attraction in Ooty do you want to stay close to?",
    inputType: "options",
    options: ["Doddabetta Peak", "Ooty Lake", "Botanical Gardens"],
  },
  {
    key: "budget",
    question: "What is your budget per night for accommodation (in INR)?",
    inputType: "slider",
    min: 1000,
    max: 20000,
  },
  {
    key: "typeOfStay",
    question: "What type of stay are you looking for?",
    inputType: "options",
    options: ["Single", "Couple", "Family", "Group"],
  },
  {
    key: "stayPreference",
    question: "Do you have a preference for the type of guests?",
    inputType: "options",
    options: ["Boys", "Girls", "No Preference"],
  },
  {
    key: "requiredFacilities",
    question: "List any specific facilities you're looking for.",
    inputType: "options",
    options: ["Free WiFi", "Gym", "Spa"],
  },
];

function Chatbot() {
  const [userData, setUserData] = useState(initialUserData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState([
    { by: "bot", message: "Hi there! I'm TravelBuddy. Let's get started. What's your name?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hotelData, setHotelData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [attractionsData, setAttractionsData] = useState([]);
  const [isFinalInput, setIsFinalInput] = useState(false);

  useEffect(() => {
    const fetchHotelData = async () => {
      const response = await fetch("/data/ooty_hotels_facilities_enhanced_data_updated.json");
      const data = await response.json();
      setHotelData(data);
    };

    fetchHotelData();
  }, []);
  useEffect(() => {
    const fetchAttractionsData = async () => {
      try {
        const response = await fetch("/data/Attractions.json");
        const data = await response.json();
        setAttractionsData(data);
      } catch (error) {
        console.error("Failed to fetch attractions data", error);
      }
    };

    fetchAttractionsData();
  }, []);
  const HotelCard = (hotel) => {
    return (
      <div className="hotel-card" onClick={() => openModal(hotel, attractionsData)}>
        <h3>{hotel?.hotel.hotelName}</h3>
        <p>{hotel?.hotel.location}</p>
        <p>Rating: {hotel?.hotel.starRating}</p>
        <p>Review: {hotel?.hotel.review}</p>
        <p>Price: {hotel?.hotel.budget}</p>
        <p>Check in Time : {hotel?.hotel.checkInTime}</p>
        <p>Check out Time : {hotel?.hotel.checkOutTime}</p>
        <p>Address : {hotel?.hotel.address}</p>
      </div>
    );
  };

  const openModal = (hotel, attractionsData) => {
    setSelectedHotel(hotel);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedHotel(null);
  };
  const normalizeString = (str) => str.toLowerCase().replace(/[\s.,'-]/g, "");

  const handleUserInput = async (value) => {
    let newHistory = [...chatHistory, { by: "user", message: value }];

    const updatedUserData = { ...userData, [questions[currentQuestionIndex].key]: value };
    setUserData(updatedUserData);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      newHistory.push({ by: "bot", message: questions[currentQuestionIndex + 1].question });
      setChatHistory(newHistory);
      setInputValue("");
      inputRef.current && inputRef.current.focus();
    } else {
      setIsLoading(true);
      try {
        const response = await axios.post("https://journeybuddy-backend.onrender.com/recommend", updatedUserData);
        setIsLoading(false);

        const hotelNamesNormalized = response.data.response.message.content
          .split("\n")
          .map((line) => normalizeString(line.substring(line.indexOf(".") + 1).trim()));

        const matchedHotels = hotelData.filter((hotel) =>
          hotelNamesNormalized.includes(normalizeString(hotel?.hotelName))
        );
        console.log("Matched hotels:", matchedHotels);
        matchedHotels.forEach((hotel) => {
          newHistory.push({
            by: "bot",
            message: <HotelCard hotel={hotel} attractionsData={attractionsData} />,
          });
        });

        setChatHistory(newHistory);
        setIsFinalInput(true);
      } catch (error) {
        console.error("Error sending data to backend:", error);
        setIsLoading(false);
        newHistory.push({ by: "bot", message: "Sorry, we encountered an error processing your request." });
        setChatHistory(newHistory);
      }
    }
  };

  const qna = async (value) => {
    setIsLoading(true); 

    try {
      const payload = { query: value };
      const response = await axios.post("https://journeybuddy-backend.onrender.com/qna", payload);
      setIsLoading(false);

      const newHistory = [...chatHistory, { by: "user", message: value }];

      const answer = typeof response.data === "string" ? response.data : response.data.answer;
      console.log(response.data);
      console.log(response);
      newHistory.push({ by: "bot", message: response.data.response.message.content });
      setChatHistory(newHistory);
      setInputValue("");
    } catch (error) {
      console.error("Error fetching data from the /qna endpoint:", error);
      setIsLoading(false);
      const errorMessage = error.response
        ? error.response.data.detail || error.response.data.message
        : "Sorry, I couldn't fetch an answer for your question. Please try again.";
      const newHistory = [...chatHistory, { by: "bot", message: errorMessage }];
      setChatHistory(newHistory);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const renderInputField = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (isFinalInput) {
      return (
        <div className="inputFinal">
          {" "}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && qna(inputValue)}
            placeholder="Type here..."
          />
          <button onClick={() => qna(inputValue)}>Submit</button>
        </div>
      );
    }
    switch (currentQuestion.inputType) {
      case "options":
        return currentQuestion.options.map((option, index) => (
          <button key={index} onClick={() => handleUserInput(option)}>
            {option}
          </button>
        ));
      case "slider":
        return (
          <>
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              value={inputValue}
              onChange={handleInputChange}
              step="100"
            />
            <div>
              {`${inputValue} INR`}
              &nbsp; &nbsp; <button onClick={() => handleUserInput(inputValue)}>Submit</button>
            </div>
          </>
        );
      case "number":
      case "text":
      default:
        return (
          <div className="inputFinal">
          <input
            ref={inputRef}
            type={currentQuestion.inputType}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleUserInput(inputValue)}
            placeholder="Type here..."
          />
          <button onClick={() => handleUserInput(inputValue)}>Submit</button>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      {modalOpen && (
        <Modal isOpen={modalOpen} close={closeModal} hotel={selectedHotel} attractionsData={attractionsData} />
      )}
      <div className="chathistory-container">
        <header>
          <h1>OotyExplorer</h1>
        </header>
        <footer>
          <img
            src="https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
            alt="Profile"
          />
          <p>User Name</p>
          <button
            onClick={() =>
              setChatHistory([
                { by: "bot", message: "Hi there! I'm TravelBuddy. Let's get started. What's your name?" },
              ])
            }
          >
            Clear Chat
          </button>
        </footer>
      </div>
      <div className="chatbot-container">
        <div className="chat-history">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`message ${chat.by}`}>
              {chat.message}
            </div>
          ))}
        </div>
        {isLoading ? <div className="loader">Loading...</div> : <div className="chat-input">{renderInputField()}</div>}
      </div>
    </div>
  );
}

export default Chatbot;
