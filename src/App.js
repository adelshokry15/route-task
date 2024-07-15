import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { FaChartBar } from "react-icons/fa";

function App() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [amountData, setAmountData] = useState([]);
  const [dateData, setDateData] = useState([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const customersResponse = await fetch(
          "http://localhost:3000/customers"
        );
        const customersData = await customersResponse.json();
        setCustomers(customersData);

        const transactionsResponse = await fetch(
          "http://localhost:3000/transactions"
        );
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    fetchData();
  }, []);

  const getCustomerTransactions = (customerId) => {
    return transactions?.filter(
      (transaction) => transaction.customer_id == customerId
    );
  };

  const filterData = () => {
    return customers.filter((customer) => {
      const customerTransactions = getCustomerTransactions(customer.id);
      const nameMatches = customer.name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const amountMatches = customerTransactions.some((transaction) =>
        transaction.amount.toString().includes(amountFilter)
      );
      return nameMatches && amountMatches;
    });
  };

  const filteredCustomers = filterData();

  const handleViewChart = (customerId, customerName) => {
    const customerTransactions = getCustomerTransactions(customerId);
    const dateShown = customerTransactions.map((e) => e.date);
    const amountShown = customerTransactions.map((e) => e.amount);

    setDateData(dateShown);
    setAmountData(amountShown);
    setSelectedCustomerName(customerName);
  };

  return (
    <div className="pt-6 px-8">
      <h1 className="text-center mb-8 font-bold text-green-900 text-2xl">
        Customers and Transactions
      </h1>
      <div className="mb-4">
        <label className="mr-4">
          Filter by Customer Name:
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="ml-2 p-1 border border-green-900 rounded"
          />
        </label>
        <label>
          Filter by Transaction Amount:
          <input
            type="text"
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
            className="ml-2 p-1 border border-green-900 rounded"
          />
        </label>
      </div>
      <table className="w-full border-2 border-green-900 mb-8">
        <thead className="text-white bg-green-900 rounded-md">
          <tr>
            <th>Customer Name</th>
            <th>Transaction Date</th>
            <th>Transaction Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer) => {
            const customerTransactions = getCustomerTransactions(customer.id);
            return customerTransactions.map((transaction, index) => (
              <tr key={transaction.id} className="p-2 border-2 text-center">
                {index === 0 && (
                  <td
                    rowSpan={customerTransactions.length}
                    className="border-r-2"
                  >
                    {customer.name}
                  </td>
                )}
                <td className="border-r-2">{transaction.date}</td>
                <td className="border-r-2">{transaction.amount}</td>
                {index === 0 && (
                  <td
                    rowSpan={customerTransactions.length}
                    className="border-r-2"
                  >
                    <button
                      onClick={() =>
                        handleViewChart(customer.id, customer.name)
                      }
                      className="mx-auto text-green-900 p-2 rounded border border-green-900 flex items-center hover:bg-green-900 hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      <FaChartBar className="mr-2" />
                      View Chart
                    </button>
                  </td>
                )}
              </tr>
            ));
          })}
        </tbody>
      </table>
      {amountData.length && dateData.length ? (
        <div className="w-full">
          <h2 className="text-center mb-4 text-green-900 text-xl">
            Transactions for {selectedCustomerName}
          </h2>
          <BarChart
            xAxis={[
              {
                id: "barCategories",
                data: dateData,
                scaleType: "band",
                label: "Transaction Date",
              },
            ]}
            yAxis={[
              {
                label: "Transaction Amount",
                labelStyle: {
                  transform: "translate(50px, -126px)",
                },
              },
            ]}
            series={[
              {
                data: amountData,
              },
            ]}
            sx={{
              width: "fit-content",
              paddingX: "20px",
            }}
            height={300}
          />
        </div>
      ) : null}
    </div>
  );
}

export default App;
