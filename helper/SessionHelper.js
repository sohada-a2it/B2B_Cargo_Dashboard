const setAuthToken = (token) =>{
    localStorage.setItem("authToken",token)
}
const getAuthToken = () =>{
    return localStorage.getItem("authToken")
}
const setEmail = (email)=>{
    localStorage.setItem("email",email);
}
const getEmail = ()=>{
    return localStorage.getItem("email");
}
const setOTP = (otp)=>{
    localStorage.setItem("otp",otp);
}
const getOTP = ()=>{
    return localStorage.getItem("otp");
}
export function clearAllSessions (){
    localStorage.removeItem("authToken");
    localStorage.removeItem("email");
    localStorage.removeItem("otp");
    localStorage.removeItem("userDetails");

    window.location.href="/login";
}
const setUserDetails = (user)=>{
    localStorage.setItem("userDetails",JSON.stringify(user));
}
const getUserDetails = () => {
    const data = localStorage.getItem("userDetails");
    return data ? JSON.parse(data) : null;
}
const logout = ()=>{
    localStorage.removeItem("authToken");
    localStorage.removeItem("email");
    localStorage.removeItem("userDetails");

    window.location.href = "/";
}
export { setAuthToken,getAuthToken,setEmail,getEmail,setOTP,getOTP,setUserDetails,getUserDetails,logout}