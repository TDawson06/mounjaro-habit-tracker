import { useState, useEffect } from "react";
import { AppShell } from "./components/AppShell.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { Habits } from "./pages/Habits.jsx";
import { Weight } from "./pages/Weight.jsx";
import { loadData, saveData } from "./lib/storage.js";

function App() {
  const [data, setData] = useState(() => loadData());
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    saveData(data);
  }, [data]);

  const page =
    activeTab === "habits" ? (
      <Habits data={data} setData={setData} />
    ) : activeTab === "weight" ? (
      <Weight data={data} setData={setData} />
    ) : (
      <Dashboard data={data} setData={setData} />
    );

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {page}
    </AppShell>
  );
}

export default App;
