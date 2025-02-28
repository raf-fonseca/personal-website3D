"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Define the context
const CoinContext = createContext();

// Total number of coins in the game
const TOTAL_COINS = 20;

// Provider component
export function CoinProvider({ children }) {
  const [collectedCoins, setCollectedCoins] = useState([]);

  // Calculate progress percentage
  const progressPercentage = (collectedCoins.length / TOTAL_COINS) * 100;

  // Function to collect a coin
  const collectCoin = (coinId) => {
    if (!collectedCoins.includes(coinId)) {
      setCollectedCoins((prev) => [...prev, coinId]);
    }
  };

  return (
    <CoinContext.Provider
      value={{
        collectedCoins,
        collectCoin,
        totalCoins: TOTAL_COINS,
        progressPercentage,
      }}
    >
      {children}
    </CoinContext.Provider>
  );
}

// Custom hook to use the context
export function useCoins() {
  const context = useContext(CoinContext);
  if (context === undefined) {
    throw new Error("useCoins must be used within a CoinProvider");
  }
  return context;
}
