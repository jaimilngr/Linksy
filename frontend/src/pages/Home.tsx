import { Cards } from "../components/Cards"
import  Gains from "../components/Gains"
import Hero from "../components/Hero"
import { Service } from "../components/Listing"
import { Navbar } from "../components/Navbar"
import { Process } from "../components/process"



export const Home = () =>{
    return <div>
            <Navbar/>
            <Hero/>
            <Process/>
            <Cards/>
            <Gains/>
            <Service/>
          
    </div>
}