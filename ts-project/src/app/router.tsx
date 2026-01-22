import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import MovieDetail from "../pages/MovieDetail/MovieDetail";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import MainLayout from "../components/layout/Mainlayout";
import Profile from "../pages/Profile/Profile";
import SearchPage from "../pages/Search/Search";
import Movies from "../pages/Movies/Movies";
import Series from "../pages/Series/Series";
import MyList from "../pages/MyList/MyList";
import SeriesDetails from "../pages/Series/SeriesDetails"
export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id" element={<SeriesDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/mylist" element={<MyList />} />
        <Route path="/" element={<Home />} />
      </Route>

      {/* Auth sayfaları header'sız olabilir */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
