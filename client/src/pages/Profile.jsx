import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile(){
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();

  if(!accessToken){
    navigate("/login");
  }

  return(
    <div className="text-white p-10">
      <h2 className="text-3xl mb-4">Your Profile</h2>
      <p>Your account is logged in.</p>
      <button onClick={logout}
              className="mt-4 bg-red-600 px-4 py-2">
        Logout
      </button>
    </div>
  );
}
