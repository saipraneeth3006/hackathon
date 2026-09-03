import "@/App.css";
import { Toaster } from "sonner";
import { BankProvider, useBank } from "@/context/BankContext";
import { LoginScreen } from "@/components/screens/LoginScreen";
import { ModeSelectScreen } from "@/components/screens/ModeSelectScreen";
import { BankApp } from "@/components/BankApp";

const Shell = () => {
  const { authed, mode } = useBank();
  if (!authed) return <LoginScreen />;
  if (!mode) return <ModeSelectScreen />;
  return <BankApp />;
};

function App() {
  return (
    <div className="App">
      <BankProvider>
        <Shell />
        <Toaster position="top-center" richColors />
      </BankProvider>
    </div>
  );
}

export default App;
