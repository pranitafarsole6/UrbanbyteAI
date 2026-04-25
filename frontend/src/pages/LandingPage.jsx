import Navbar from "../components/landing/Navbar"
import HeroSection from "../components/landing/HeroSection"
import ProcessSection from "../components/landing/ProcessSection"
import SustainabilityImpact from "../components/landing/SustainabilityImpact"
import CTASection from "../components/landing/CTASection"
import Footer from "../components/landing/Footer"

export default function LandingPage(){
 return(
  <div>

   <Navbar/>

   <HeroSection/>

   <ProcessSection/>

   <SustainabilityImpact/>

   <CTASection/>

   <Footer/>

  </div>
 )
}
