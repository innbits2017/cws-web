
"use client";

import { useEffect, useState } from "react";

import {
  getMaterials,
  type Material,
} from "@/lib/api/materials";

import {
  getMaterialParameters,
  type MaterialParameter,
} from "@/lib/api/materialParameters";

interface OrderDraft {
  id: number;
  orderNumber: string;
  enabled: boolean;
  values: Record<string, string>;
}

export default function NewBatchPage() {
  // Material states
  const [materials, setMaterials] = useState<Material[]>([]);
  const [parameters, setParameters] = useState<MaterialParameter[]>([]);
  const [selectedMaterial, setSelectedMaterial] =
    useState<Material | null>(null);

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [loadingParameters, setLoadingParameters] = useState(false);

  // Batch states
  const [batchName, setBatchName] = useState("");
  const [batchDescription, setBatchDescription] = useState("");
  const [errorMode, setErrorMode] = useState(false);
  const [skipMode, setSkipMode] = useState(false);

  // Order states
  const [orders, setOrders] = useState<OrderDraft[]>([]);

  // General states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const executeAll =
    orders.length > 0 && orders.every((order) => order.enabled);

  // Load materials
  useEffect(() => {
    async function loadMaterials() {
      try {
        const data = await getMaterials();

        setMaterials(
          data.filter((material) => material.isActive)
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load materials"
        );
      } finally {
        setLoadingMaterials(false);
      }
    }

    loadMaterials();
  }, []);

  // Search materials
  const filteredMaterials = materials.filter((material) => {
    const term = search.toLowerCase().trim();

    if (!term) return true;

    return (
      material.materialCode.toLowerCase().includes(term) ||
      material.description.toLowerCase().includes(term) ||
      material.revision.toLowerCase().includes(term) ||
      material.pdmDescription.toLowerCase().includes(term)
    );
  });

  // Select material
  async function selectMaterial(material: Material) {
    setSelectedMaterial(material);
    setSearch(`${material.materialCode} / ${material.revision}`);
    setBatchDescription(material.description);

    setShowDropdown(false);
    setParameters([]);
    setOrders([]);
    setError("");
    setSuccess("");
    setLoadingParameters(true);

    try {
      const data = await getMaterialParameters(
        material.materialCode,
        material.revision
      );

      setParameters(
        [...data].sort(
          (a, b) => a.displayOrder - b.displayOrder
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load material parameters"
      );
    } finally {
      setLoadingParameters(false);
    }
  }

  // Clear material
  function clearMaterial() {
    setSelectedMaterial(null);
    setSearch("");
    setParameters([]);
    setOrders([]);
    setBatchDescription("");
    setShowDropdown(false);
  }

  // Add order
  function addOrder() {
    if (!selectedMaterial || parameters.length === 0) return;

    const nextNumber =
      orders.reduce((max, order) => {
        const number = Number.parseInt(order.orderNumber, 10);
        return Number.isNaN(number) ? max : Math.max(max, number);
      }, 0) + 1;

    const defaultValues: Record<string, string> = {};

    parameters.forEach((parameter) => {
      defaultValues[parameter.parameterName] =
        parameter.defaultValue ?? "";
    });

    const newOrder: OrderDraft = {
      id: Date.now(),
      orderNumber: `${nextNumber}-010`,
      enabled: true,
      values: defaultValues,
    };

    setOrders((previous) => [...previous, newOrder]);
  }

  // Remove order
  function removeOrder(id: number) {
    setOrders((previous) =>
      previous.filter((order) => order.id !== id)
    );
  }

  // Update parameter value
  function updateOrderValue(
    orderId: number,
    parameterName: string,
    value: string
  ) {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId
          ? {
              ...order,
              values: {
                ...order.values,
                [parameterName]: value,
              },
            }
          : order
      )
    );
  }

  // Enable / disable order
  function toggleOrder(orderId: number) {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId
          ? {
              ...order,
              enabled: !order.enabled,
            }
          : order
      )
    );
  }

  // Execute all checkbox
  function toggleAllOrders(checked: boolean) {
    setOrders((previous) =>
      previous.map((order) => ({
        ...order,
        enabled: checked,
      }))
    );
  }

  // Save placeholder
  function handleSave() {
    setError("");
    setSuccess("");

    if (!selectedMaterial) {
      setError("Please select a KONE material.");
      return;
    }

    if (!batchName.trim()) {
      setError("Please enter a batch name.");
      return;
    }

    if (orders.length === 0) {
      setError("Please add at least one test order.");
      return;
    }

    setSuccess(
      "Validation successful. Batch creation API will be connected in the next step."
    );
  }

  const selectedOrders = orders.filter(
    (order) => order.enabled
  ).length;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">

      {/* Top Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">

        <div className="flex items-center gap-3">

          <div className="flex gap-0.5">
            {"KONE".split("").map((letter, index) => (
              <span
                key={index}
                className="flex h-8 w-8 items-center justify-center bg-[#0755b8] text-base font-bold text-white"
              >
                {letter}
              </span>
            ))}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-800">
              CWS Portal
            </p>
            <p className="text-[10px] text-slate-400">
              Configuration Management
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-500 sm:block">
            Local environment
          </span>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
            DE
          </div>
        </div>

      </header>

      <main className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">

        {/* Page Heading */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div>
            <div className="mb-2 text-xs text-slate-400">
              Home / My Batches / New Batch
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Test Batch
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Configure materials and test orders for your batch.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={() => window.history.back()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="rounded-lg bg-[#0755b8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#06469a]"
            >
              Save Batch
            </button>

            <button
              onClick={() =>
                alert("Batch execution will be implemented next.")
              }
              disabled={!selectedMaterial || selectedOrders === 0}
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ▶ Execute
            </button>

          </div>

        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Batch Information */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <h2 className="text-sm font-bold text-slate-800">
              Batch Information
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Select your material and enter batch information.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">

            {/* Material Search */}
            <div className="relative z-20">

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                KONE Material <span className="text-red-500">*</span>
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSelectedMaterial(null);
                    setParameters([]);
                    setOrders([]);
                    setBatchDescription("");
                    setShowDropdown(true);
                    setError("");
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={
                    loadingMaterials
                      ? "Loading materials..."
                      : "Search material code or description..."
                  }
                  disabled={loadingMaterials}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <span className="absolute right-3 top-3 text-lg text-slate-400">
                  ⌕
                </span>

              </div>

              {showDropdown && (

                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">

                  {loadingMaterials ? (

                    <div className="p-4 text-sm text-slate-500">
                      Loading materials...
                    </div>

                  ) : filteredMaterials.length > 0 ? (

                    filteredMaterials.map((material) => (

                      <button
                        key={`${material.materialCode}-${material.revision}`}
                        onClick={() => selectMaterial(material)}
                        className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-blue-50"
                      >

                        <div className="flex items-center justify-between gap-3">

                          <span className="text-sm font-semibold text-slate-800">
                            {material.materialCode}
                          </span>

                          <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                            Rev. {material.revision}
                          </span>

                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {material.description}
                        </p>

                      </button>

                    ))

                  ) : (

                    <div className="p-4 text-sm text-slate-500">
                      No matching materials found.
                    </div>

                  )}

                </div>

              )}

              {selectedMaterial && (
                <div className="mt-2 flex items-center justify-between">

                  <span className="text-xs font-medium text-green-700">
                    ✓ Material selected
                  </span>

                  <button
                    onClick={clearMaterial}
                    className="text-xs font-medium text-red-500 hover:text-red-700"
                  >
                    Change material
                  </button>

                </div>
              )}

            </div>

            {/* Description */}
            <div>

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Description
              </label>

              <input
                type="text"
                value={batchDescription}
                onChange={(event) =>
                  setBatchDescription(event.target.value)
                }
                placeholder="Material description"
                disabled={!selectedMaterial}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-70"
              />

            </div>

            {/* Batch ID */}
            <div>

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Batch ID
              </label>

              <input
                type="text"
                value="Auto-generated on save"
                disabled
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400"
              />

            </div>

            {/* Batch Name */}
            <div>

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Batch Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={batchName}
                onChange={(event) =>
                  setBatchName(event.target.value)
                }
                placeholder="Enter batch name"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* Batch Settings */}
          <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 bg-slate-50/70 px-5 py-4">

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
              <input
                type="checkbox"
                checked={errorMode}
                onChange={(event) =>
                  setErrorMode(event.target.checked)
                }
                className="h-4 w-4 accent-blue-600"
              />
              Error Mode
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
              <input
                type="checkbox"
                checked={skipMode}
                onChange={(event) =>
                  setSkipMode(event.target.checked)
                }
                className="h-4 w-4 accent-blue-600"
              />
              Skip Mode
            </label>

          </div>

        </section>

        {/* Selected Material */}
        {selectedMaterial && (

          <section className="mt-5 rounded-xl border border-green-200 bg-green-50/50 p-5">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                  Selected KONE Material
                </p>

                <h3 className="mt-2 text-lg font-bold text-slate-800">
                  {selectedMaterial.materialCode}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {selectedMaterial.description}
                </p>

              </div>

              <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                Revision {selectedMaterial.revision}
              </span>

            </div>

            <div className="mt-4 border-t border-green-100 pt-3">

              {loadingParameters ? (

                <p className="text-xs text-slate-500">
                  Loading material parameters...
                </p>

              ) : (

                <p className="text-xs text-slate-500">
                  {parameters.length} material parameters loaded
                </p>

              )}

            </div>

          </section>

        )}

        {/* Material Parameter Preview */}
        {selectedMaterial && !loadingParameters && (

          <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">

              <h2 className="text-sm font-bold text-slate-800">
                Material Parameters
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Default values retrieved from the material database.
              </p>

            </div>

            <div className="dashboard-scrollbar overflow-x-auto">

              <table className="w-full min-w-[650px] text-sm">

                <thead>

                  <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">

                    <th className="px-5 py-3">Parameter</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Default Value</th>
                    <th className="px-5 py-3">Unit</th>
                    <th className="px-5 py-3">Required</th>

                  </tr>

                </thead>

                <tbody>

                  {parameters.map((parameter) => (

                    <tr
                      key={parameter.id}
                      className="border-t border-slate-100 hover:bg-blue-50/40"
                    >

                      <td className="px-5 py-3 font-medium text-slate-700">
                        {parameter.parameterName}
                      </td>

                      <td className="px-5 py-3 text-slate-500">
                        {parameter.parameterType}
                      </td>

                      <td className="px-5 py-3 text-slate-700">
                        {parameter.defaultValue}
                      </td>

                      <td className="px-5 py-3 text-slate-500">
                        {parameter.unit || "—"}
                      </td>

                      <td className="px-5 py-3">
                        {parameter.isRequired ? (
                          <span className="text-xs font-semibold text-green-700">
                            Required
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Optional
                          </span>
                        )}
                      </td>

                    </tr>

                  ))}

                  {parameters.length === 0 && (

                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-8 text-center text-sm text-slate-400"
                      >
                        No parameters configured for this material.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </section>

        )}

        {/* Test Orders */}
        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Test Order Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">

            <div>

              <h2 className="text-sm font-bold text-slate-800">
                Test Orders
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Configure individual test order parameters.
              </p>

            </div>

            <div className="flex flex-wrap items-center gap-4">

              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">

                <input
                  type="checkbox"
                  checked={executeAll}
                  disabled={orders.length === 0}
                  onChange={(event) =>
                    toggleAllOrders(event.target.checked)
                  }
                  className="h-4 w-4 accent-blue-600"
                />

                Execute all orders

              </label>

              <button
                disabled={
                  !selectedMaterial ||
                  loadingParameters ||
                  parameters.length === 0
                }
                onClick={addOrder}
                className="rounded-lg bg-[#0755b8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#06469a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add Order
              </button>

            </div>

          </div>

          {/* Order Grid */}
          {!selectedMaterial ? (

            <div className="p-10 text-center">

              <div className="text-3xl text-slate-300">
                ▦
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                Select a material first
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Material parameters will appear here.
              </p>

            </div>

          ) : loadingParameters ? (

            <div className="p-10 text-center text-sm text-slate-500">
              Loading material parameters...
            </div>

          ) : orders.length === 0 ? (

            <div className="p-10 text-center">

              <div className="text-3xl text-slate-300">
                ▦
              </div>

              <p className="mt-3 text-sm font-medium text-slate-700">
                No test orders added
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Click Add Order to create your first configuration.
              </p>

            </div>

          ) : (

            <div className="dashboard-scrollbar overflow-x-auto">

              <table className="w-full border-collapse text-xs">

                <thead>

                  <tr className="bg-[#edf4fc]">

                    <th className="sticky left-0 z-20 min-w-[210px] border-b border-r border-slate-200 bg-[#edf4fc] px-4 py-3 text-left font-bold text-slate-600">
                      CHARACTERISTIC
                    </th>

                    <th className="min-w-[100px] border-b border-r border-slate-200 px-3 py-3 text-left font-bold text-slate-600">
                      TYPE
                    </th>

                    <th className="min-w-[100px] border-b border-r border-slate-200 px-3 py-3 text-left font-bold text-slate-600">
                      DEFAULT
                    </th>

                    {orders.map((order) => (

                      <th
                        key={order.id}
                        className="min-w-[160px] border-b border-r border-slate-200 px-3 py-3"
                      >

                        <div className="flex items-center justify-between gap-2">

                          <label className="flex items-center gap-2 font-bold text-slate-700">

                            <input
                              type="checkbox"
                              checked={order.enabled}
                              onChange={() => toggleOrder(order.id)}
                              className="h-3.5 w-3.5 accent-blue-600"
                            />

                            {order.orderNumber}

                          </label>

                          <button
                            onClick={() => removeOrder(order.id)}
                            className="text-base text-slate-400 hover:text-red-600"
                            title="Remove order"
                          >
                            ×
                          </button>

                        </div>

                        <p className="mt-1 text-left text-[10px] font-normal text-slate-400">
                          Configuration {orders.indexOf(order) + 1}
                        </p>

                      </th>

                    ))}

                  </tr>

                </thead>

                <tbody>

                  {parameters.map((parameter) => (

                    <tr
                      key={parameter.id}
                      className="transition hover:bg-blue-50/40"
                    >

                      <td className="sticky left-0 z-10 border-b border-r border-slate-100 bg-white px-4 py-2 font-semibold text-slate-700">

                        {parameter.parameterName}

                        {parameter.isRequired && (
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        )}

                      </td>

                      <td className="border-b border-r border-slate-100 px-3 py-2 text-slate-500">
                        {parameter.parameterType}
                      </td>

                      <td className="border-b border-r border-slate-100 px-3 py-2 font-medium text-slate-600">
                        {parameter.defaultValue}
                      </td>

                      {orders.map((order) => (

                        <td
                          key={order.id}
                          className="border-b border-r border-slate-100 px-2 py-1.5"
                        >

                          <input
                            type="text"
                            value={
                              order.values[parameter.parameterName] ?? ""
                            }
                            disabled={!order.enabled}
                            onChange={(event) =>
                              updateOrderValue(
                                order.id,
                                parameter.parameterName,
                                event.target.value
                              )
                            }
                            className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
                          />

                        </td>

                      ))}

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3">

            <span className="text-xs text-slate-500">
              {parameters.length} parameters · {orders.length} test orders
            </span>

            <span className="text-xs font-semibold text-blue-700">
              {selectedOrders} orders selected for execution
            </span>

          </div>

        </section>

        {/* Bottom Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">

          <p className="text-xs text-slate-400">
            CWS Web 2.0 · Test Batch Configuration
          </p>

          <div className="flex gap-2">

            <button
              onClick={() => window.history.back()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="rounded-lg bg-[#0755b8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#06469a]"
            >
              Save Batch
            </button>

          </div>

        </div>

      </main>

      {/* Dropdown backdrop */}
      {showDropdown && (
        <button
          aria-label="Close material search"
          className="fixed inset-0 z-10 cursor-default"
          onClick={() => setShowDropdown(false)}
        />
      )}

    </div>
  );
}
