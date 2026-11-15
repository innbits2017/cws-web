
"use client";

import { useEffect, useState } from "react";
import { getBatches, type Batch } from "@/lib/api/batches";

export default function ApiTestPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBatches() {
      try {
        const data = await getBatches();
        setBatches(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    loadBatches();
  }, []);

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Backend API Test</h1>

      {loading && <p>Loading batches...</p>}

      {error && (
        <p className="text-red-600">
          API Error: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <p className="mb-4">
            Successfully fetched {batches.length} batches.
          </p>

          <pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
            {JSON.stringify(batches, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
