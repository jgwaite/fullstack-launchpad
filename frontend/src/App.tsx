import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./app/app.css";

import { AppProviders } from "@/app/providers";
import { TodoAppShell } from "@/features/todos/components/todo-app-shell";
import { TodoDashboard } from "@/features/todos/components/todo-dashboard";

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <TodoAppShell>
          <Routes>
            <Route path="/" element={<TodoDashboard />} />
            <Route
              path="*"
              element={
                <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
                  <p>Route not found. Head back to the dashboard.</p>
                </div>
              }
            />
          </Routes>
        </TodoAppShell>
      </BrowserRouter>
    </AppProviders>
  );
}
