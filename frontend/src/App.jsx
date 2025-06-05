import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import TodoList from "./components/TodoList"
import Navbar from "./components/Navbar"
import SearchTable from "./components/SearchTable"
function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<TodoList/>}/>
        <Route path="/table" element={<SearchTable/>}/>
      </Routes>
    </Router>
  )
}

export default App
