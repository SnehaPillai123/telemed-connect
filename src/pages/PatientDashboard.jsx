import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-teal-600">Doctor Dashboard</h1>
          <button onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-700">Welcome, Dr. <strong>{user?.displayName}</strong>! 👋</p>
          <p className="text-gray-500 mt-1">{user?.email}</p>
          <p className="text-teal-600 mt-4 font-medium">More features coming soon...</p>
        </div>
      </div>
    </div>
  );
}