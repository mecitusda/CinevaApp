import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

export default function MainLayout() {

  return (
    <>
      <Header />
       <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#111",
            color: "#fff",
          },
        }}
      />
      <main>
        <Outlet />
      </main>
      <Footer/>
    </>
  );
}
