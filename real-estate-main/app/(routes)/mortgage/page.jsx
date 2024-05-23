"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(loanAmount);
    const annualInterestRate = parseFloat(interestRate) / 100;
    const months = parseInt(loanTerm) * 12;

    if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(months)) {
      setError("Please enter valid numbers for all fields.");
      return;
    }

    const monthlyInterestRate = annualInterestRate / 12;
    const monthlyPayment =
      (principal * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -months));

    setMonthlyPayment(monthlyPayment.toFixed(2));
    setError("");

    // Store data in Supabase
    storeData(principal, annualInterestRate, months, monthlyPayment);
  };

  const storeData = async (
    principal,
    annualInterestRate,
    months,
    monthlyPayment
  ) => {
    const { data, error } = await supabase
      .from("mortgage_calculations")
      .insert([
        {
          principal,
          annual_interest_rate: annualInterestRate,
          months,
          monthly_payment: monthlyPayment,
        },
      ]);

    if (error) {
      console.error("Error inserting data:", error);
    } else {
      console.log("Data inserted:", data);
      fetchRecords(); // Fetch records after inserting new data
    }
  };

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("mortgage_calculations")
      .select();

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setRecords(data);
    }
  };

  const deleteRecord = async (id) => {
    const { error } = await supabase
      .from("mortgage_calculations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting data:", error);
    } else {
      console.log("Data deleted");
      fetchRecords(); // Fetch records after deleting
    }
  };

  return (
    <div className="p-10">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mortgage Calculator</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Loan Amount
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Interest Rate (%)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Loan Term (years)
          </label>
          <input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <button
            onClick={calculateMonthlyPayment}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Calculate
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {monthlyPayment && (
          <div className="mt-4">
            <h2 className="text-xl font-bold">
              Monthly Payment: ${monthlyPayment}
            </h2>
          </div>
        )}
        <h2 className="text-2xl font-bold mt-8">Calculation Records</h2>
        <table className="min-w-full mt-4 bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4">Principal</th>
              <th className="py-2 px-4">Annual Interest Rate</th>
              <th className="py-2 px-4">Loan Term (Months)</th>
              <th className="py-2 px-4">Monthly Payment</th>
              <th className="py-2 px-4">Created At</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td className="border px-4 py-2">${record.principal}</td>
                <td className="border px-4 py-2">
                  {(record.annual_interest_rate * 100).toFixed(2)}%
                </td>
                <td className="border px-4 py-2">{record.months}</td>
                <td className="border px-4 py-2">
                  ${parseFloat(record.monthly_payment).toFixed(2)}
                </td>
                <td className="border px-4 py-2">
                  {new Date(record.created_at).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MortgageCalculator;
