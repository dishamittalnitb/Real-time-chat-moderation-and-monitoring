// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Navigate } from "react-router-dom";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from "recharts";

// const COLORS = {
//   approved: "#22c55e",
//   rephrased: "#eab308",
//   unmoderated: "#94a3b8",
// };

// const AdminDashboard = () => {
//   const token = localStorage.getItem("adminToken");

//   const [overview, setOverview] = useState({
//     total: 0,
//     stats: [],
//     avgToxicity: 0,
//   });

//   const [daily, setDaily] = useState([]);
//   const [topDays, setTopDays] = useState([]);

//   if (!token) return <Navigate to="/admin" />;

//   // useEffect(() => {
//   //   const headers = { Authorization: `Bearer ${token}` };

//   //   const fetchData = async () => {
//   //     const [overviewRes, dailyRes, topDaysRes] = await Promise.all([
//   //       axios.get("http://localhost:5001/api/admin/stats/overview", { headers }),
//   //       axios.get("http://localhost:5001/api/admin/stats/daily", { headers }),
//   //       axios.get("http://localhost:5001/api/admin/stats/insights/top-days", {
//   //         headers,
//   //       }),
//   //     ]);

//   //     setOverview(overviewRes.data);

//   //     const normalizedDaily = dailyRes.data.map((d) => ({
//   //       ...d,
//   //       rephraseRate:
//   //         d.total > 0 ? ((d.rephrased / d.total) * 100).toFixed(1) : 0,
//   //     }));

//   //     setDaily(normalizedDaily);
//   //     setTopDays(topDaysRes.data);
//   //   };

//   //   fetchData();
//   // }, [token]);



//  useEffect(() => {
//     if (!token) return;

//     const headers = { Authorization: `Bearer ${token}` };

//     const fetchData = async () => {
//       try {
//         const [overviewRes, dailyRes, topDaysRes] = await Promise.all([
//           axios.get("http://localhost:5001/api/admin/stats/overview", { headers }),
//           axios.get("http://localhost:5001/api/admin/stats/daily", { headers }),
//           axios.get(
//             "http://localhost:5001/api/admin/stats/insights/top-days",
//             { headers }
//           ),
//         ]);

//         setOverview(overviewRes.data);

//         const normalizedDaily = dailyRes.data.map((d) => ({
//           ...d,
//           rephraseRate:
//             d.total > 0 ? ((d.rephrased / d.total) * 100).toFixed(1) : 0,
//         }));

//         setDaily(normalizedDaily);
//         setTopDays(topDaysRes.data);
//       } catch (err) {
//         console.error("Admin analytics fetch failed:", err);
//       }
//     };

//     fetchData();
//   }, [token]);

//   // ✅ redirect AFTER hooks
//   if (!token) {
//     return <Navigate to="/admin" />;
//   }


//   const getCount = (status) =>
//     overview.stats.find((s) => s._id === status)?.count || 0;

//   const approved = getCount("approved");
//   const rephrased = getCount("rephrased");
//   const unmoderated = getCount("unmoderated");

//   return (
//     <div className="min-h-screen bg-black text-white p-6">
//       <h1 className="text-3xl font-bold mb-8">Admin Analytics Dashboard</h1>

//       {/* KPI CARDS */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
//         <div className="bg-yellow-500 text-black p-5 rounded-xl">
//           <h3>Rephrased</h3>
//           <p className="text-3xl">{rephrased}</p>
//         </div>

//         <div className="bg-green-600 p-5 rounded-xl">
//           <h3>Approved</h3>
//           <p className="text-3xl">{approved}</p>
//         </div>

//         <div className="bg-gray-700 p-5 rounded-xl">
//           <h3>Unmoderated</h3>
//           <p className="text-3xl">{unmoderated}</p>
//         </div>

//         <div className="bg-gray-800 p-5 rounded-xl">
//           <h3>Total</h3>
//           <p className="text-3xl">{overview.total}</p>
//         </div>
//       </div>

//       {/* LINE CHART */}
//       <div className="bg-gray-900 p-6 rounded-xl mb-12">
//         <h2 className="mb-4">Daily Rephrased vs Total</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={daily}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#444" />
//             <XAxis dataKey="_id" stroke="#aaa" />
//             <YAxis stroke="#aaa" />
//             <Tooltip />
//             <Line dataKey="total" stroke="#3b82f6" strokeWidth={2} />
//             <Line dataKey="rephrased" stroke="#eab308" strokeWidth={2} />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* PIE CHART */}
//       <div className="bg-gray-900 p-6 rounded-xl mb-12">
//         <h2 className="mb-4">Moderation Distribution</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <PieChart>
//             <Pie
//               data={[
//                 { name: "Approved", value: approved },
//                 { name: "Rephrased", value: rephrased },
//                 { name: "Unmoderated", value: unmoderated },
//               ]}
//               dataKey="value"
//               outerRadius={100}
//               label
//             >
//               <Cell fill={COLORS.approved} />
//               <Cell fill={COLORS.rephrased} />
//               <Cell fill={COLORS.unmoderated} />
//             </Pie>
//             <Tooltip />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       {/* BAR CHART – TOP MODERATED DAYS */}
//       <div className="bg-gray-900 p-6 rounded-xl">
//         <h2 className="mb-4">Top Rephrased Days</h2>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={topDays}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#444" />
//             <XAxis dataKey="_id" stroke="#aaa" />
//             <YAxis stroke="#aaa" />
//             <Tooltip />
//             <Bar dataKey="rephrased" fill="#eab308" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const COLORS = {
  approved: "#22c55e",
  rephrased: "#eab308",
  unmoderated: "#94a3b8",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [overview, setOverview] = useState({
    total: 0,
    stats: [],
    avgToxicity: 0,
  });

  const [daily, setDaily] = useState([]);
  const [topDays, setTopDays] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [overviewRes, dailyRes, topDaysRes] = await Promise.all([
          axios.get("http://localhost:5001/api/admin/stats/overview", {
            headers,
          }),
          axios.get("http://localhost:5001/api/admin/stats/daily", {
            headers,
          }),
          axios.get(
            "http://localhost:5001/api/admin/stats/insights/top-days",
            { headers }
          ),
        ]);

        setOverview(overviewRes.data);

        const normalizedDaily = dailyRes.data.map((d) => ({
          ...d,
          rephraseRate:
            d.total > 0 ? ((d.rephrased / d.total) * 100).toFixed(1) : 0,
        }));

        setDaily(normalizedDaily);
        setTopDays(topDaysRes.data);
      } catch (error) {
        console.error("Admin dashboard fetch failed:", error);
      }
    };

    fetchData();
  }, [token, navigate]);

  const getCount = (status) =>
    overview.stats.find((s) => s._id === status)?.count || 0;

  const approved = getCount("approved");
  const rephrased = getCount("rephrased");
  const unmoderated = getCount("unmoderated");

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-8">
        Admin Analytics Dashboard
      </h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-yellow-500 text-black p-5 rounded-xl">
          <h3>Rephrased</h3>
          <p className="text-3xl">{rephrased}</p>
        </div>

        <div className="bg-green-600 p-5 rounded-xl">
          <h3>Approved</h3>
          <p className="text-3xl">{approved}</p>
        </div>

        <div className="bg-gray-700 p-5 rounded-xl">
          <h3>Unmoderated</h3>
          <p className="text-3xl">{unmoderated}</p>
        </div>

        <div className="bg-gray-800 p-5 rounded-xl">
          <h3>Total</h3>
          <p className="text-3xl">{overview.total}</p>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-gray-900 p-6 rounded-xl mb-12">
        <h2 className="mb-4">Daily Rephrased vs Total</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="_id" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Line dataKey="total" stroke="#3b82f6" strokeWidth={2} />
            <Line dataKey="rephrased" stroke="#eab308" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART */}
      <div className="bg-gray-900 p-6 rounded-xl mb-12">
        <h2 className="mb-4">Moderation Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Approved", value: approved },
                { name: "Rephrased", value: rephrased },
                { name: "Unmoderated", value: unmoderated },
              ]}
              dataKey="value"
              outerRadius={100}
              label
            >
              <Cell fill={COLORS.approved} />
              <Cell fill={COLORS.rephrased} />
              <Cell fill={COLORS.unmoderated} />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* BAR CHART */}
      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="mb-4">Top Rephrased Days</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topDays}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="_id" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Bar dataKey="rephrased" fill="#eab308" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;

