// ... keep all your existing imports
import { Settings2 } from "lucide-react"; // Additional icon

export default function ManageBatches() {
  // ... keep existing states and hooks

  return (
    <div className="min-h-screen bg-[#e8f0f2] p-4 lg:p-8 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-[1400px] flex gap-6 h-[85vh]">
        
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/60 overflow-hidden">
          
          {/* HEADER SECTION */}
          <header className="flex justify-between items-center mb-8 px-2">
            {/* ... search and user profile (keep same as your code) */}
          </header>

          {!selectedBatch ? (
            /* VIEW 1: BATCH CARDS (keep same as your code) */
          ) : (
            /* VIEW 2: CALENDAR & DETAIL VIEW */
