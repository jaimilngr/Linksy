import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Home } from './pages/Home'

function App() {

  return( 
  <>
      <BrowserRouter>
      <Routes>

      <Route path="/signup" element={<Signup />}/>
      <Route path="/" element={<Home />}/>

      </Routes>
      </BrowserRouter>

  </>
  )
}

export default App
