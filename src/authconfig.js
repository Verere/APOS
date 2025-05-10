export const authConfig = {
  providers:[],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = auth?.user;
      console.log(isLoggedIn)
       const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
     
      if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      } else return false
           
      // if (isOnDashboard) {
      //   if (isLoggedIn) return true;
      //   return false; // Redirect unauthenticated users to login page
      // } else if (isLoggedIn) {
      //   return Response.redirect(new URL("/dashboard", request.nextUrl));
      // }
      // return true;     
    },
  },
};
