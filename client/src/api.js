const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://tns-website.onrender.com";

export async function apiCall(url, method="GET", data=null, token=null){
  const res = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type":"application/json",
      ...(token ? { Authorization:`Bearer ${token}` } : {}),
    },
    credentials:"include",
    body: data ? JSON.stringify(data) : null,
  });

  return res.json();
}

export async function refreshToken(){
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`,{
    method:"POST",
    credentials:"include"
  });

  if(res.ok){
    const data = await res.json();
    return data.accessToken;
  }
  return null;
}
