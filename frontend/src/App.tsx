import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Home } from './pages/Home'
import LocomotiveScroll from 'locomotive-scroll';

function App() {
  const locomotiveScroll = new LocomotiveScroll();

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
