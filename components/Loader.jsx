import { useState, useEffect } from "react";
import { useProgress } from "@react-three/drei";

const loadingMessages = [
  "Turning flat webpages into island getaways...",
  "Teaching robots not to fear heights...",
  "Convincing pixels this is not a 2D vacation...",
  "Proving websites can actually be fun...",
  "Installing auto pilot...",
  "Mapping hidden easter eggs...",
  "Rendering reality because 2D just wasn't enough...",
  "Collecting coins because robots need savings too...",
  "Loading but in 3D!...",
];

const Loader = () => {
  const { progress, active } = useProgress();
  const [currentMessage, setCurrentMessage] = useState(() =>
    Math.floor(Math.random() * loadingMessages.length)
  );
  const [usedMessages, setUsedMessages] = useState(() => [
    Math.floor(Math.random() * loadingMessages.length),
  ]);

  const getRandomMessage = () => {
    if (usedMessages.length === loadingMessages.length) {
      setUsedMessages([]); // Reset if all messages have been used
    }

    let availableMessages = loadingMessages.filter(
      (_, index) => !usedMessages.includes(index)
    );
    const randomIndex = Math.floor(Math.random() * availableMessages.length);
    const selectedIndex = loadingMessages.indexOf(
      availableMessages[randomIndex]
    );

    setUsedMessages((prev) => [...prev, selectedIndex]);
    return selectedIndex;
  };

  useEffect(() => {
    if (!active) return; // Only rotate messages while loading

    // Rotate messages every 2 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(getRandomMessage());
    }, 2000);

    return () => {
      clearInterval(messageInterval);
    };
  }, [active]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#94c5f8] to-[#daefff]">
      <div className="flex flex-col items-center gap-[2vh] w-[90vw] max-w-[800px]">
        <div className="h-[4vh] min-h-[32px] text-[clamp(0.875rem,2vw,1rem)] font-semibold text-[#2e7d32] w-full text-center transition-opacity duration-500 whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]">
          {loadingMessages[currentMessage]}
        </div>
        <div className="w-full h-[0.5vh] min-h-[8px] bg-white/80 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#4caf50] to-[#8bc34a] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;
