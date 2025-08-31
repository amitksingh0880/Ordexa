import { useEffect, useState } from "react";

type SagaExecution = {
  id: string;
  sagaName: string;
  status: string;
  steps: {
    name: string;
    success: boolean;
    attempts: number;
    error?: string;
  }[];
  compensated: boolean;
  startedAt: string;
  finishedAt: string;
};

export default function SagaDashboardPage() {
  const [executions, setExecutions] = useState<SagaExecution[]>([]);

  useEffect(() => {
    fetch("/api/saga-executions")
      .then((res) => res.json())
      .then(setExecutions)
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧩 Saga Executions</h1>
      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Steps</th>
            <th className="p-2 border">Compensated</th>
            <th className="p-2 border">Started</th>
            <th className="p-2 border">Duration</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((saga) => (
            <tr key={saga.id} className="border-t">
              <td className="p-2 border">{saga.sagaName}</td>
              <td className="p-2 border">
                {saga.status === "success" ? "✅" : "❌"} {saga.status}
              </td>
              <td className="p-2 border">
                <ul className="text-sm list-disc ml-4">
                  {saga.steps.map((step, idx) => (
                    <li key={idx}>
                      {step.name} —{" "}
                      {step.success ? "✅" : `❌ (Attempted ${step.attempts})`}
                      {step.error && <div className="text-red-500">{step.error}</div>}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="p-2 border">{saga.compensated ? "🧯 Yes" : "—"}</td>
              <td className="p-2 border">
                {new Date(saga.startedAt).toLocaleString()}
              </td>
              <td className="p-2 border">
                {Math.floor(
                  (new Date(saga.finishedAt).getTime() - new Date(saga.startedAt).getTime()) /
                    1000
                )}
                s
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
